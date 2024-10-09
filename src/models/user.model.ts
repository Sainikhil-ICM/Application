import { HydratedDocument, ObjectId, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from './abstract.model';
import { UserRole, UserStatus } from 'src/constants/user.const';
import { InvitationSource } from 'src/constants/access-control.const';

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.phone_secret;
            delete ret.email_secret;
            delete ret.password_reset_token;
            delete ret.password_reset_token_secret;
            delete ret.password_secret;
            delete ret.api_token;
            return ret;
        },
    },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'users',
})
class User extends AbstractDocument {
    @Prop({
        type: String,
        enum: UserRole,
        default: UserRole.SALES,
    })
    role: UserRole;

    @Prop({ type: [String] })
    _temp_roles: UserRole[];

    @Prop({ type: String })
    code: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String, default: '91' })
    phone_code: string;

    @Prop({ type: String })
    phone_number: string;

    @Prop({ type: String })
    phone_secret: string;

    @Prop({ type: Boolean, default: false })
    phone_verified: boolean;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String })
    email_secret: string;

    @Prop({ type: String })
    birth_date: string;

    @Prop({ type: String })
    gender: string;

    @Prop({ type: Boolean, default: false })
    email_verified: boolean;

    @Prop({ type: String, unique: true, sparse: true })
    pan_number: string;

    @Prop({ type: String })
    password_secret: string;

    @Prop({ type: String })
    crypto_password: string;

    @Prop({ type: String })
    password_reset_token_secret: string;

    @Prop({ type: String })
    address: string;

    @Prop({ type: String })
    city: string;

    @Prop({ type: String })
    pin_code: string;

    @Prop({ type: String })
    state: string;

    @Prop({ type: String })
    referral_code: string;

    // @Prop({ type: String, unique: true })
    // access_token: string;

    // @Prop({ type: Date })
    // access_token_expires_at: string;

    // access token for bonds api
    @Prop({ type: String })
    api_token: string;

    @Prop({ type: Boolean, default: false })
    is_admin: boolean;

    @Prop({
        type: SchemaTypes.ObjectId,
        index: true,
    })
    bank_account_id: ObjectId;

    // @Prop({ type: Boolean, default: false })
    // is_dictator: boolean;

    @Prop({ type: Date })
    created_at: Date;

    @Prop({ type: String })
    zoho_id: string;

    @Prop({ type: String })
    digio_doc_id: string;

    @Prop({
        type: String,
        enum: UserStatus,
        default: UserStatus.INVITATION_SENT,
    })
    status: UserStatus;

    @Prop({ type: [String] })
    access_controls: string[];

    @Prop({
        type: String,
        enum: InvitationSource,
        default: InvitationSource.WEBSITE,
    })
    invitation_source: InvitationSource;

    @Prop({ type: Boolean, default: false })
    is_active: boolean;

    @Prop({
        // type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Shop' }],
        type: [SchemaTypes.ObjectId],
        index: true,
    })
    role_group_ids: ObjectId[];

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;
}

type UserDocument = HydratedDocument<User>;
const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('role_groups', {
    ref: 'RoleGroup',
    localField: 'role_group_ids',
    foreignField: '_id',
});

UserSchema.virtual('account', {
    ref: 'Account',
    localField: 'account_id',
    foreignField: '_id',
    justOne: true,
});

export { User, UserDocument, UserSchema };
