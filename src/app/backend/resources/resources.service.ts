import {
    resourceCategoryMap,
    ResourceCategory,
    ResourceStatus,
    ResourceType,
} from 'src/constants/resource.const';
import { Injectable } from '@nestjs/common';
import { ObjectId, Types } from 'mongoose';
import { SessionUser, UserRole } from 'src/constants/user.const';
import { Resource, ResourceDocument } from 'src/models/resource.model';
import AttachmentService from 'src/services/attachment.service';
import { GetResourcesDto } from './dto/get-resources.dto';
import { ResProps } from 'src/constants/constants';
import { CreateResourceDto } from './dto/create-resource.dto';
import { ResProps1 } from 'types';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourcesRepository } from './resources.repository';

@Injectable()
export class ResourcesService {
    constructor(
        private readonly attachmentService: AttachmentService,
        private readonly resourcesRepository: ResourcesRepository,
    ) {}

    private async updateAttachment(
        session: SessionUser,
        resourceId: string,
        files: Express.Multer.File[],
    ): Promise<string> {
        if (files && files.length) {
            // upload attachment file
            const attachments = await this.attachmentService.createResourceAttachments(files, {
                resource_id: resourceId,
                account_id: session.account_id,
                user_id: session.user_id,
            });

            // ASSERTION: there will only be 1 attachment per resource so the
            // return array should only contain one attachment
            const attachment = attachments[0];

            // save the reference of the attachment on the resource
            return attachment.id;
        } else {
            return null;
        }
    }

    async createResource(
        session: SessionUser,
        createResourceDto: CreateResourceDto,
        files: Express.Multer.File[],
    ): Promise<ResProps1<ResourceDocument>> {
        const resource = await this.resourcesRepository.createResource(
            {
                ...createResourceDto,
                user_id: session.user_id,
                account_id: session.account_id,
            },
            createResourceDto.role_group_types,
        );

        if (!resource) {
            return {
                success: false,
                message: 'Resource creation failed.',
            };
        }

        const attachmentId = await this.updateAttachment(session, resource.id, files);
        if (attachmentId) {
            resource.attachment_id = attachmentId as unknown as ObjectId;
            await resource.save();
        }

        return {
            success: true,
            data: resource,
            message: 'Resource successfully created.',
        };
    }

    async getResources(session: SessionUser, query: GetResourcesDto): Promise<ResProps> {
        const per_page = query.per_page || 10;
        const page = query.page || 1;

        const resourcesQuery = { account_id: session.account_id };

        if (query.name) {
            resourcesQuery['name'] = { $regex: new RegExp(query.name, 'i') };
        }

        if (query.category) {
            resourcesQuery['category'] = query.category;
        }

        if (query.sub_category) {
            resourcesQuery['sub_category'] = query.sub_category;
        }

        if (query.status) {
            resourcesQuery['status'] = query.status;
        }

        if (session.role !== UserRole.ADMIN) {
            resourcesQuery['status'] = ResourceStatus.ACTIVE;
        }

        const resourcesResult = await this.resourcesRepository.find(
            resourcesQuery,
            { per_page, page },
            session.roles,
            session.role,
        );

        const total = resourcesResult.total;
        const resources = resourcesResult.docs as Resource[];
        for (const resource of resources) {
            if (resource.type === ResourceType.DOCUMENT) {
                try {
                    const attachment = await this.attachmentService.getAttachment(
                        resource.attachment_id,
                    );
                    resource.link = attachment.location;
                } catch (error) {
                    console.error('Failed to fetch resource attachment', error);
                }
            }
        }

        if (resources.length === 0) {
            return {
                success: false,
                message: 'No Resources Found',
            };
        }

        return {
            success: true,
            data: {
                collection: resources,
                total_count: total,
                per_page,
                page,
            },
        };
    }

    async getResource(session: SessionUser, _id: string): Promise<ResProps> {
        const resource = await this.resourcesRepository.getResource(
            { _id: new Types.ObjectId(_id) },
            session.roles,
            session.role,
        );

        if (!resource) {
            return {
                success: false,
                message: 'Resource not found.',
            };
        }

        if (resource.type === ResourceType.DOCUMENT) {
            try {
                const attachment = await this.attachmentService.getAttachment(
                    resource.attachment_id,
                );
                resource.link = attachment.location;
            } catch (error) {
                console.error('Failed to fetch resource attachment', error);
            }
        }

        return {
            success: true,
            data: resource,
        };
    }

    async updateResource(
        session: SessionUser,
        resourceId: string,
        updateResourceDto: UpdateResourceDto,
        files: Express.Multer.File[],
    ): Promise<ResProps1<Resource>> {
        const resourceRoleGroupsTypes = await this.resourcesRepository
            // Getting the role group types of the resource.
            .getResourceRoleGroupTypes({ resource_id: resourceId });

        // Checking if the user has access to the resource.
        const hasAccess = resourceRoleGroupsTypes.some((roleGroupType) =>
            (session.roles as string[]).includes(roleGroupType),
        );

        if (!hasAccess && session.role !== UserRole.ADMIN) {
            return {
                success: false,
                message: 'Unauthorized, you cannot edit this resource.',
            };
        }

        const updateQuery = { ...updateResourceDto };
        const attachmentId = await this.updateAttachment(session, resourceId, files);
        if (attachmentId) updateQuery['attachment_id'] = attachmentId;

        const resource = await this.resourcesRepository.updateResource(
            { _id: resourceId, account_id: session.account_id },
            { ...updateQuery },
        );

        if (!resource) {
            return {
                success: false,
                message: 'Resource not found.',
            };
        }

        return {
            success: true,
            data: resource,
            message: 'Resource successfully updated.',
        };
    }

    async deleteResource(session: SessionUser, resourceId: string): Promise<ResProps1<Resource>> {
        const resourceRoleGroupsTypes = await this.resourcesRepository.getResourceRoleGroupTypes({
            resource_id: resourceId,
        });

        const canDelete = session.roles.some((role) => resourceRoleGroupsTypes.includes(role));

        if (!canDelete && session.role !== UserRole.ADMIN) {
            return {
                success: false,
                message: 'Unauthorized.',
            };
        }

        const resource = await this.resourcesRepository.deleteResource({ _id: resourceId });

        if (!resource) {
            return {
                success: false,
                message: 'Resource not found.',
            };
        }

        return {
            success: true,
            data: resource,
            message: 'Resource successfully deleted.',
        };
    }
}
