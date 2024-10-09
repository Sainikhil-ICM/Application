import { ObjectId, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AccessControlStatus, InvitationSource } from 'src/constants/access-control.const';
import { AbstractDocument } from './abstract.model';
import { HydratedDocument } from 'mongoose';

@Schema({
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
    collection: 'access_controls',
})
class AccessControl extends AbstractDocument {
    @Prop({
        type: String,
        enum: AccessControlStatus,
        default: AccessControlStatus.INVITATION_SENT,
    })
    status: AccessControlStatus;

    @Prop({ type: [String] })
    roles: string[];

    @Prop({
        type: String,
        enum: InvitationSource,
        default: InvitationSource.WEBSITE,
    })
    invitation_source: InvitationSource;

    @Prop({ type: Boolean, default: false })
    is_active: boolean;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    user_id: ObjectId;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;

    @Prop({ type: Date })
    created_at: Date;
}

type AccessControlDocument = HydratedDocument<AccessControl>;
const AccessControlSchema = SchemaFactory.createForClass(AccessControl);

AccessControlSchema.virtual('user', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});

AccessControlSchema.virtual('account', {
    ref: 'Account',
    localField: 'account_id',
    foreignField: '_id',
    justOne: true,
});

export { AccessControl, AccessControlDocument, AccessControlSchema };
