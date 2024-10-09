import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Attachment, AttachmentDocument } from 'src/models/attachment.model';
import { Model, ObjectId, Schema, Types } from 'mongoose';
import UploadService from './upload.service';
import { AttachmentType, AttachmentTypeMap, FileType } from 'src/constants/attachment.const';
import {
    CustomerAttachment,
    CustomerAttachmentDocument,
} from 'src/models/customer-attachment.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class AttachmentService {
    constructor(
        @InjectModel(Attachment.name)
        private readonly attachmentModel: Model<AttachmentDocument>,
        @InjectModel(CustomerAttachment.name)
        private readonly customerAttachmentModel: Model<CustomerAttachmentDocument>,
        private readonly uploadService: UploadService,
        private readonly configService: ConfigService,
    ) {}

    s3BaseUrl = this.configService.get<string>('AWS.S3_BASE_URL');

    async createAttachment(
        file: Express.Multer.File | FileType,
        params: {
            customer_id: string;
            account_id: string;
        },
    ): Promise<Attachment> {
        try {
            const { customer_id, account_id } = params;
            const location = `customers/${customer_id}/${file.originalname}`;
            const resUploadFile = await this.uploadService.uploadFile(
                `customers/${customer_id}`,
                file,
            );

            return await this.attachmentModel.findOneAndUpdate(
                { customer_id, type: AttachmentTypeMap[file.fieldname] },
                {
                    name: file.originalname,
                    description: '',
                    mime_type: file.mimetype,
                    size: file.size,
                    location: location,
                    metadata: resUploadFile,
                    customer_id: customer_id,
                    account_id: account_id,
                },
                { upsert: true, new: true },
            );
        } catch (error) {
            console.log('🚀 ~ AttachmentService ~ createAttachment ~ error:', error);
            throw new ServiceUnavailableException('Could not upload the file.');
        }
    }

    async createKycFormAttachment(
        file: Express.Multer.File | FileType,
        params: {
            customer_id: string;
            account_id: string;
        },
    ): Promise<AttachmentDocument> {
        try {
            const { customer_id, account_id } = params;
            const path = `customers/kyc-forms/${customer_id}`;
            const fileLocation = `customers/kyc-forms/${customer_id}/${file.originalname}`;
            const resUploadFile = await this.uploadService.uploadFile(path, file);

            return await this.attachmentModel.findOneAndUpdate(
                { customer_id, type: AttachmentTypeMap[file.fieldname] },
                {
                    name: file.originalname,
                    description: '',
                    mime_type: file.mimetype,
                    size: file.size,
                    location: fileLocation,
                    metadata: resUploadFile,
                    customer_id: customer_id,
                    account_id: account_id,
                },
                { upsert: true, new: true },
            );
        } catch (error) {
            console.log('🚀 ~ AttachmentService ~ createAttachment ~ error:', error);
            throw new ServiceUnavailableException('Could not upload the file.');
        }
    }

    async createCustomerAttachment(
        file: Express.Multer.File | FileType,
        params: {
            customer_id: string;
            account_id?: ObjectId;
            user_id?: ObjectId;
        },
    ): Promise<AttachmentDocument> {
        const resUploadFile = await this.uploadService.uploadFile(
            `customers/${params.customer_id}`,
            file,
        );
        const location = `customers/${params.customer_id}/${file.originalname}`;

        const attachment = new this.attachmentModel();
        attachment.set('name', file.originalname);
        attachment.set('description', '');
        attachment.set('mime_type', file.mimetype);
        attachment.set('size', file.size);
        attachment.set('location', location);
        attachment.set('metadata', resUploadFile);
        attachment.set('user_id', params.user_id);

        await attachment.save();

        await this.customerAttachmentModel.findOneAndUpdate(
            {
                customer_id: params.customer_id,
                type: file.fieldname,
            },
            { attachment_id: attachment.id },
            { upsert: true, new: true },
        );

        attachment.location = `${this.s3BaseUrl}/${attachment.location}`;

        return attachment;
    }

    async getCustomerAttachments(
        customer_id: string,
    ): Promise<{ id: string; type: AttachmentType; location: string; link: string }[]> {
        const customerId = new Types.ObjectId(customer_id);
        return this.customerAttachmentModel.aggregate([
            { $match: { customer_id: customerId } },
            {
                $lookup: {
                    from: 'attachments',
                    localField: 'attachment_id',
                    foreignField: '_id',
                    as: 'attachments',
                },
            },
            { $unwind: '$attachments' },
            {
                $project: {
                    _id: 0,
                    id: '$attachments._id',
                    type: '$type',
                    location: '$attachments.location',
                    link: { $concat: [this.s3BaseUrl, '/', '$attachments.location'] },
                },
            },
        ]);
    }

    async upsertCustomAttachment(
        file: Express.Multer.File,
        params: {
            path: string;
            account_id: ObjectId;
            user_id: ObjectId;
            type: AttachmentType;
        },
    ): Promise<AttachmentDocument> {
        const resUploadFile = await this.uploadService.uploadFile(params.path, file);
        const location = `${params.path}/${file.originalname}`;

        const changes: Partial<Attachment> = {
            name: file.originalname,
            description: '',
            mime_type: file.mimetype,
            size: file.size,
            location,
            metadata: resUploadFile,
        };

        return this.attachmentModel.findOneAndUpdate(
            {
                user_id: params.user_id,
                type: params.type,
            },
            { ...changes },
            { upsert: true, background: false, new: true },
        );
    }

    async createResourceAttachments(
        files: Express.Multer.File[],
        params: {
            resource_id: string;
            account_id: ObjectId;
            user_id: ObjectId;
        },
    ): Promise<AttachmentDocument[]> {
        const fileUploads = files.map(async (file: Express.Multer.File) => {
            const resUploadFile = await this.uploadService.uploadFile(
                `resources/${params.resource_id}`,
                file,
            );
            const location = `resources/${params.resource_id}/${file.originalname}`;

            const attachment = new this.attachmentModel();
            attachment.set('name', file.originalname);
            attachment.set('description', '');
            attachment.set('mime_type', file.mimetype);
            attachment.set('size', file.size);
            attachment.set('location', location);
            attachment.set('metadata', resUploadFile);
            attachment.set('user_id', params.user_id);

            await attachment.save();

            return attachment;
        });
        const results = await Promise.all(fileUploads);
        return results;
    }

    async getAttachment(attachment_id: Schema.Types.ObjectId, validitySeconds = 900) {
        const attachment = await this.attachmentModel.findById(attachment_id);

        if (!attachment) {
            throw new Error(`Attachment with id ${attachment_id} does not exist`);
        }

        attachment.location = await this.uploadService.getPreSignedUrl(
            `${this.s3BaseUrl}/${attachment.location}`,
            validitySeconds,
        );
        return attachment;
    }
}
