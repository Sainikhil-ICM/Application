import { HydratedDocument, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';

export type UserLinkDocument = HydratedDocument<UserLink>;

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
    collection: 'user_links',
})
export class UserLink {
    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    manager_id: ObjectId;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    reportee_id: ObjectId;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;
}

const UserLinkSchema = SchemaFactory.createForClass(UserLink);

UserLinkSchema.index({ manager_id: 1, reportee_id: 1 }, { unique: true });

export { UserLinkSchema };
