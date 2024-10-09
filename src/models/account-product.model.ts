import { HydratedDocument, Schema, ObjectId } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';

export type AccountProductDocument = HydratedDocument<AccountProduct>;

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
    collection: 'account_products',
})
export class AccountProduct {
    // Setting maximum return rate for the customer in listed bonds
    @Prop({ type: Number, default: 0 })
    max_return_rate: number;

    // Setting minimum price deviation for the customer in unlisted equities
    @Prop({ type: Number, default: 0 })
    min_price_deviation: number;

    // Setting maximum price deviation for the customer in unlisted equities
    @Prop({ type: Number, default: 0 })
    max_price_deviation: number;

    @Prop({
        type: String,
        required: true,
        index: true,
    })
    product_isin: string;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;
}

const AccountProductSchema = SchemaFactory.createForClass(AccountProduct);

export { AccountProductSchema };
