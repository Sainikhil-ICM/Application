import {
    Resource,
    ResourceDocument,
    ResourceRoleGroup,
    ResourceRoleGroupDocument,
    UserDocument,
} from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

export interface IResourcesReturn extends ResourceDocument {
    role_groups: string[];
    created_by: UserDocument;
}

interface IPagination {
    per_page: number;
    page: number;
}

@Injectable()
export class AccountsRepository {
    protected readonly logger = new Logger(AccountsRepository.name);

    constructor(
        @InjectModel(Resource.name)
        private resourceModel: Model<ResourceDocument>,
        @InjectModel(ResourceRoleGroup.name)
        private resourceRoleGroupModel: Model<ResourceRoleGroupDocument>,
    ) {}

    async getResources(
        query: FilterQuery<ResourceDocument>,
        pagination: IPagination,
        roles: string[] = [],
    ): Promise<{ docs: IResourcesReturn[]; total: number }> {
        const [results] = await this.resourceModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'resource_role_groups',
                    localField: '_id',
                    foreignField: 'resource_id',
                    as: 'role_groups',
                    pipeline: [{ $match: { role_group_type: { $in: roles } } }],
                },
            },
            {
                $match: {
                    role_groups: {
                        $not: {
                            $size: 0,
                        },
                    },
                },
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
}
