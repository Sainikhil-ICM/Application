import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@SchemaOptions({
    toJSON: {
        versionKey: false,
        transform: (_, ret) => {
            delete ret._id;
            delete ret.phone_secret;
            return ret;
        },
    },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'temp_customers',
})
class TempCustomer {
    @Prop({ type: String, required: true, unique: true })
    phone_number: string;

    @Prop({ type: String })
    phone_secret: string;

    @Prop({ type: Date })
    phone_secret_expires_at: Date;

    @Prop({ type: String, default: '91' })
    phone_code: string;

    @Prop({ type: String, default: 'temp' })
    type: string;

    @Prop({ type: Boolean, default: false })
    is_phone_verified: boolean;
}

type TempCustomerDocument = HydratedDocument<TempCustomer>;
const TempCustomerSchema = SchemaFactory.createForClass(TempCustomer);

export { TempCustomer, TempCustomerDocument, TempCustomerSchema };
