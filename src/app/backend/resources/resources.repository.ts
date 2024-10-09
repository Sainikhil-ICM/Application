import {
    Resource,
    ResourceDocument,
    ResourceRoleGroup,
    ResourceRoleGroupDocument,
    UserDocument,
} from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, UpdateQuery } from 'mongoose';
import { AccessControlList } from 'src/constants/access-control.const';
import { UserRole } from 'src/constants/user.const';

export interface IResourcesReturn extends ResourceDocument {
    role_groups: string[];
    created_by: UserDocument;
}

interface IPagination {
    per_page: number;
    page: number;
}

@Injectable()
export class ResourcesRepository {
    protected readonly logger = new Logger(ResourcesRepository.name);

    constructor(
        @InjectModel(Resource.name)
        private resourceModel: Model<ResourceDocument>,
        @InjectModel(ResourceRoleGroup.name)
        private resourceRoleGroupModel: Model<ResourceRoleGroupDocument>,
    ) {}

    async createResource(
        createQuery: Resource,
        roleGroupTypes: string[],
    ): Promise<ResourceDocument> {
        const resource = await this.resourceModel.create({ ...createQuery });

        if (!resource) return null;

        for (const roleGroupType of roleGroupTypes) {
            await this.resourceRoleGroupModel.create({
                role_group_type: roleGroupType,
                account_id: resource.account_id,
                resource_id: resource.id,
            });
        }

        return resource;
    }

    async find(
        query: FilterQuery<ResourceDocument>,
        pagination: IPagination,
        roles: string[] = [],
        userRole: UserRole,
    ): Promise<{ docs: IResourcesReturn[]; total: number }> {
        const resourceRoleGroupFilter: any = {
            from: 'resource_role_groups',
            localField: '_id',
            foreignField: 'resource_id',
            as: 'role_groups',
        };

        const roleGroupMatchQuery: any = {};
        if (userRole !== UserRole.ADMIN) {
            resourceRoleGroupFilter.pipeline = [{ $match: { role_group_type: { $in: roles } } }];

            roleGroupMatchQuery.role_groups = {
                $not: {
                    $size: 0,
                },
            };
        }

        const [results] = await this.resourceModel.aggregate([
            { $match: query },
            {
                $lookup: resourceRoleGroupFilter,
            },
            {
                $match: roleGroupMatchQuery,
            },
            {
                $facet: {
                    total: [
                        {
                            $count: 'count',
                        },
                    ],
                    docs: [
                        {
                            $sort: { updated_at: -1 },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        { $unwind: '$user' },
                        {
                            $lookup: {
                                from: 'resource_role_groups',
                                localField: '_id',
                                foreignField: 'resource_id',
                                as: 'role_groups',
                            },
                        },
                        { $skip: (pagination.page - 1) * pagination.per_page },
                        { $limit: pagination.per_page },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                name: 1,
                                created_at: 1,
                                updated_at: 1,
                                created_by: '$user.name',
                                role_groups: 1,
                                category: 1,
                                sub_category: 1,
                                status: 1,
                                link: 1,
                                type: 1,
                                attachment_id: 1,
                                user_id: 1,
                                account_id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    docs: 1,
                    total: {
                        $arrayElemAt: ['$total.count', 0],
                    },
                },
            },
        ]);

        for (const doc of results.docs) {
            doc.role_groups = doc.role_groups.map((role_group) => role_group.role_group_type);
        }

        return results;
    }

    async getResourceRoleGroupTypes(
        filterQuery: FilterQuery<ResourceRoleGroupDocument>,
    ): Promise<string[]> {
        const resourceRoleGroups = await this.resourceRoleGroupModel
            .find(filterQuery)
            .lean({ virtuals: true });
        return resourceRoleGroups.map(({ role_group_type }) => role_group_type);
    }

    async getResource(
        filterQuery: FilterQuery<ResourceDocument>,
        roles: AccessControlList[],
        userRole: UserRole,
    ): Promise<ResourceDocument> {
        const results = await this.find(filterQuery, { per_page: 1, page: 1 }, roles, userRole);

        return results.docs?.[0];
    }

    private async updateResourceRoleGroups(
        resourceId: ObjectId,
        accountId: ObjectId,
        updatedRoleGroupTypes: string[],
    ): Promise<void> {
        const resourceRoleGroupTypes = await this.getResourceRoleGroupTypes({
            resource_id: resourceId,
        });

        for (const roleGroupType of resourceRoleGroupTypes) {
            if (!updatedRoleGroupTypes.includes(roleGroupType)) {
                await this.resourceRoleGroupModel.deleteOne({
                    resource_id: resourceId,
                    role_group_type: roleGroupType,
                });
            }
        }

        for (const roleGroupType of updatedRoleGroupTypes) {
            if (!resourceRoleGroupTypes.includes(roleGroupType)) {
                await this.resourceRoleGroupModel.create({
                    role_group_type: roleGroupType,
                    resource_id: resourceId,
                    account_id: accountId,
                });
            }
        }
    }

    async updateResource(
        filterQuery: FilterQuery<ResourceDocument>,
        updateQuery: UpdateQuery<ResourceDocument>,
    ): Promise<ResourceDocument> {
        const resource = await this.resourceModel.findOneAndUpdate(filterQuery, updateQuery, {
            new: true,
        });

        if (updateQuery.role_group_types) {
            await this.updateResourceRoleGroups(
                filterQuery._id,
                filterQuery.account_id,
                updateQuery.role_group_types,
            );
        }

        return resource;
    }

    async deleteResource(filterQuery: FilterQuery<ResourceDocument>): Promise<ResourceDocument> {
        await this.resourceRoleGroupModel.deleteMany({ resource_id: filterQuery._id });
        return this.resourceModel.findOneAndDelete(filterQuery).lean<ResourceDocument>(true);
    }
}
