import { HydratedDocument, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import { WebhookEventTypes } from 'src/constants/webhook.const';

export type WebhookDocument = HydratedDocument<Webhook>;

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
    collection: 'webhooks',
})
export class Webhook {
    @Prop({ type: String })
    url: string;

    @Prop({ type: String, default: 'POST' })
    method: string;

    @Prop({
        type: [String],
        enum: [WebhookEventTypes],
    })
    events: WebhookEventTypes[];

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;
}

const WebhookSchema = SchemaFactory.createForClass(Webhook);

export { WebhookSchema };
