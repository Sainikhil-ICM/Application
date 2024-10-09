import { HydratedDocument, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';

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
    collection: 'user_customers',
})
export class UserCustomer {
    // read only | initiate payment
    @Prop({ type: [String], default: [], enum: [] })
    roles: string[];

    // Customer belongs to user / account
    @Prop({ type: Boolean, default: false })
    is_first_contact: boolean;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    customer_id: ObjectId;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    user_id: ObjectId;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;
}

type UserCustomerDocument = HydratedDocument<UserCustomer>;
const UserCustomerSchema = SchemaFactory.createForClass(UserCustomer);

UserCustomerSchema.virtual('customer', {
    ref: 'Customer',
    localField: 'customer_id',
    foreignField: '_id',
    justOne: true,
});

UserCustomerSchema.virtual('advisor', {
    ref: 'User',
    localField: 'user_id',
    foreignField: '_id',
    justOne: true,
});

UserCustomerSchema.virtual('account', {
    ref: 'Account',
    localField: 'account_id',
    foreignField: '_id',
    justOne: true,
});

export { UserCustomerDocument, UserCustomerSchema };
