import { Document, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';

export type BankAccountDocument = BankAccount & Document;

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
    collection: 'bank_accounts',
})
export class BankAccount {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    number: string;

    @Prop({ type: String, required: true })
    ifsc_code: string;

    @Prop({ type: String })
    address: string;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    user_id: ObjectId;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
