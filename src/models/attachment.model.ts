import { HydratedDocument, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import { AttachmentType } from 'src/constants/attachment.const';

export type AttachmentDocument = HydratedDocument<Attachment>;

@SchemaOptions({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.metadata;
            return ret;
        },
    },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'attachments',
})
export class Attachment {
    @Prop({ type: String })
    name: string; // slugify

    @Prop({ type: String })
    description: string;

    // TODO: delete
    @Prop({ type: String, enum: AttachmentType })
    type: string;

    @Prop({ type: String })
    mime_type: string;

    @Prop({ type: Number })
    size: number;

    // Relative location of the file in the S3 bucket
    @Prop({ type: String })
    location: string;

    @Prop({ type: Schema.Types.Mixed })
    metadata: any;

    @Prop({ type: Boolean, default: false })
    is_deleted: boolean;

    @Prop({
        type: Schema.Types.ObjectId,
        // required: true,
        // index: true,
    })
    user_id: ObjectId;

    // TODO: delete
    @Prop({
        type: Schema.Types.ObjectId,
    })
    customer_id: ObjectId;

    // TODO: delete
    @Prop({
        type: Schema.Types.ObjectId,
    })
    account_id: ObjectId;
}

const AttachmentSchema = SchemaFactory.createForClass(Attachment);

AttachmentSchema.virtual('link').get(function () {
    return `${process.env.S3_BASE_URL}/${this.location}`;
});

AttachmentSchema.virtual('customer', {
    ref: 'Customer',
    localField: 'customer_id',
    foreignField: '_id',
    justOne: true,
});

AttachmentSchema.virtual('account', {
    ref: 'Account',
    localField: 'account_id',
    foreignField: '_id',
    justOne: true,
});

export { AttachmentSchema };
