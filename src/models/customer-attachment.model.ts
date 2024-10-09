import { HydratedDocument, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import { AttachmentType } from 'src/constants/attachment.const';

@SchemaOptions({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            return ret;
        },
    },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'customer_attachments',
})
export class CustomerAttachment {
    @Prop({
        type: String,
        enum: AttachmentType,
        required: true,
    })
    type: AttachmentType;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    attachment_id: ObjectId;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    customer_id: ObjectId;
}

type CustomerAttachmentDocument = HydratedDocument<CustomerAttachment>;
const CustomerAttachmentSchema = SchemaFactory.createForClass(CustomerAttachment);

// CustomerAttachmentSchema.virtual('link').get(function () {
//     return `https://assets.partner.incredmoney.com/${this.location}`;
// });

export { CustomerAttachmentDocument, CustomerAttachmentSchema };
