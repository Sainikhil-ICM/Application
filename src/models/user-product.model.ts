import { HydratedDocument, ObjectId, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from './abstract.model';

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        },
    },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'user_products',
})
class UserProduct extends AbstractDocument {
    // Setting maximum return rate for the customer in listed bonds
    @Prop({ type: Number, default: 0 })
    max_return_rate: number;

    // Setting minimum price deviation for the customer in unlisted equities
    @Prop({ type: Number, default: 0 })
    min_price_deviation: number;

    // Setting maximum price deviation for the customer in unlisted equities
    @Prop({ type: Number, default: 0 })
    max_price_deviation: number;

    @Prop({ type: String })
    group_name: string;

    // @Prop({ type: Schema.Types.ObjectId })
    // group_id: string;

    @Prop({
        type: String,
        required: true,
        index: true,
    })
    product_isin: string;

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
}

type UserProductDocument = HydratedDocument<UserProduct>;
const UserProductSchema = SchemaFactory.createForClass(UserProduct);

UserProductSchema.index(
    { product_isin: 1, user_id: 1, group_name: 1 },
    { unique: true, partialFilterExpression: { group_name: { $exists: true } } },
);

export { UserProduct, UserProductDocument, UserProductSchema };
