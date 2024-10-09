import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attachment, AttachmentSchema } from 'src/models/attachment.model';
import { CustomerAttachment, CustomerAttachmentSchema } from 'src/models/customer-attachment.model';
import { Resource, ResourceSchema } from 'src/models/resource.model';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import AttachmentService from 'src/services/attachment.service';
import UploadService from 'src/services/upload.service';
import { ResourceRoleGroup, ResourceRoleGroupSchema } from 'src/models/resource-role-group.model';
import { ResourcesRepository } from './resources.repository';
import { User, UserSchema } from 'src/models';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Attachment.name, schema: AttachmentSchema },
            { name: CustomerAttachment.name, schema: CustomerAttachmentSchema },
            { name: Resource.name, schema: ResourceSchema },
            { name: ResourceRoleGroup.name, schema: ResourceRoleGroupSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ResourcesController],
    providers: [ResourcesService, AttachmentService, UploadService, ResourcesRepository],
})
export class ResourcesModule {}
