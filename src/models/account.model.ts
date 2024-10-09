import { HydratedDocument } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory, raw } from '@nestjs/mongoose';
import { AccountType, LogoType } from 'src/constants/account.const';

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
    collection: 'accounts',
})
class Account {
    @Prop({ type: String })
    name: string;

    @Prop({
        type: String,
        enum: AccountType,
        default: AccountType.INDIVIDUAL,
    })
    type: string;

    @Prop({ type: String, default: 'ICMP000' })
    code: string;

    @Prop({ type: String, default: 'ICMP' })
    code_prefix: string;

    // ACTIVE, INACTIVE, SUSPENDED
    @Prop({ type: String })
    status: string;

    // @Prop({
    //     type: String,
    //     default: 'https://assets.partner.incredmoney.com/logos/incredmoney/logo.png',
    // })
    // logo: string;

    @Prop(
        raw({
            type: { type: String, enum: LogoType, default: LogoType.STANDARD },
            url: {
                type: String,
                default: 'https://assets.partner.incredmoney.com/logos/default.svg',
            },
        }),
    )
    logo: Record<string, any>;

    @Prop({ type: String })
    api_token: string;

    // TODO - Remove this field
    // access token for bonds api
    // Currently used for PAN validation.
    @Prop({ type: String })
    user_api_token: string;

    @Prop({ type: String })
    webhooks: string; // url, events

    @Prop({ type: Boolean, default: false })
    is_deleted: boolean;
}

type AccountDocument = HydratedDocument<Account>;
const AccountSchema = SchemaFactory.createForClass(Account);

// AccountSchema.virtual('access_controls', {
//     ref: 'AccessControl',
//     localField: '_id',
//     foreignField: 'account_id',
// });

export { Account, AccountDocument, AccountSchema };
