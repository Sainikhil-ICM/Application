import { HydratedDocument, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import { LeadStatus, LeadType } from 'src/constants/lead.const';

export type LeadDocument = HydratedDocument<Lead>;

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
    collection: 'leads',
})
export class Lead {
    @Prop({ type: String, required: true, unique: true })
    slug: string;

    // @Prop({ type: Boolean, default: false })
    // is_prospect: boolean;

    @Prop({ type: String, default: LeadStatus.PENDING })
    status: LeadStatus;

    @Prop({ type: String, default: LeadType.PRODUCT })
    type: LeadType;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    phone_code: string;

    @Prop({ type: String })
    phone_number: string;

    @Prop({ type: String })
    product_isin: string;

    @Prop({ type: Number })
    product_units: number;

    @Prop({ type: Number })
    product_xirr: number;

    // secret for Otp
    @Prop({ type: String })
    phone_secret: string;

    // Consent Details
    @Prop({ type: Boolean, default: false })
    is_phone_verified: boolean;

    @Prop({ type: Schema.Types.ObjectId })
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

const LeadSchema = SchemaFactory.createForClass(Lead);

export { LeadSchema };
