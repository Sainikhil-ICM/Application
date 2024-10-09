import { ProductType } from 'src/constants/product.const';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, SchemaTypes } from 'mongoose';
import { MfSubType, OrderStatus, ScheduleType } from 'src/constants/payment.const';

@Schema()
export class MutualFundDetails {
    @Prop({ type: String })
    mf_item_id: string;

    @Prop({ type: String })
    sip_start_date: string;

    @Prop({ type: String })
    stp_start_date: string;

    @Prop({
        type: String,
        enum: MfSubType,
    })
    sub_type: MfSubType;
    @Prop({ type: String })
    swp_start_date: string;

    @Prop({ type: Number })
    installments: number;

    // Order IDs from BSE for mutual funds
    @Prop({ type: [String] })
    order_ids: string[];

    @Prop({ type: String })
    child_order: string;

    @Prop({ type: [String] })
    sip_registraion_id: string[];
}

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.consent_secret;
            return ret;
        },
    },
    toObject: { virtuals: true },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'payments',
})
export class Payment {
    @Prop({ type: String })
    group_order_id: string;

    @Prop({ type: String })
    customer_email: string;

    @Prop({ type: String })
    customer_name: string;

    @Prop({ type: String })
    customer_upi: string;

    @Prop({ type: String, default: 'Payment link sent' })
    ops_remark: string;

    // TODO - update the enum to const
    @Prop({
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'rejected', 'accepted', 'refunded'],
    })
    ops_status: string;

    @Prop({
        type: String,
        enum: ScheduleType,
    })
    payment_schedule: ScheduleType;

    @Prop({
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PAYMENT_LINK_SENT,
    })
    status: string;

    @Prop({ type: String })
    date: string;

    @Prop({ type: String })
    demat_number: string;

    // Depository participant
    @Prop({ type: String })
    dp_name: string;

    @Prop({ type: String })
    payment_mode: string;

    @Prop({ type: String })
    bank_id: string;

    @Prop({ type: String })
    upi_id: string;

    @Prop({ type: String })
    utr_number: string;

    // TODO: required: true, check in webhook
    @Prop({ type: String })
    product_code: string;

    // TODO: required: true, check in webhook
    @Prop({ type: String })
    product_name: string;

    // TODO: required: true, check in webhook
    @Prop({ type: String })
    product_isin: string;

    @Prop({ type: String })
    to_product_isin: string;

    @Prop({ type: String, enum: ProductType })
    product_type: ProductType;

    // TODO: required: true, check in webhook
    @Prop({ type: String })
    product_issuer: string;

    // TODO - rename to trxn_date
    @Prop({ type: Date })
    ordered_at: string;

    @Prop({ type: String })
    trade_date: string;

    // @Prop({ type: String })
    // transaction_date: string;

    @Prop({ type: String, default: 'purchase' })
    type: string;

    @Prop({ type: String })
    message: string;

    @Prop({ type: String })
    switch_to: string;

    @Prop({ type: String })
    switch_from: string;

    @Prop({ type: Number })
    unit_price: number;

    @Prop({ type: Number })
    units: number;

    @Prop({ type: Number })
    return_rate: number;

    @Prop({ type: Number })
    units_under_benefit: number;

    @Prop({ type: Number })
    user_amount: number;

    @Prop({ type: SchemaTypes.Mixed })
    metadata: any;

    // Secret for OTP
    @Prop({ type: String })
    consent_secret: string;

    // Recording customer consent
    @Prop({ type: Boolean, default: false })
    is_consent_given: boolean;

    // Group of payments/products
    @Prop({ type: String })
    group_isin: string;

    @Prop({ type: SchemaTypes.ObjectId })
    group_id: ObjectId;

    // Order ID from Razorpay
    @Prop({ type: String })
    order_id: string;

    // Payment link from B2C
    @Prop({ type: String })
    link: string;

    // Transaction ID from B2C
    @Prop({ type: String })
    transaction_id: string;

    // Order ID from B2C
    @Prop({ type: SchemaTypes.ObjectId })
    foreign_id: ObjectId;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    customer_id: ObjectId;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    advisor_id: ObjectId;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;

    @Prop({ type: String })
    zoho_id: string;

    @Prop({ type: String })
    folio_number: string;

    @Prop({ type: String })
    frequency: string;

    @Prop({ type: Boolean, default: false })
    is_approved: boolean;

    // secret for mobile
    @Prop({ type: String })
    phone_secret: string;

    // secret for email
    @Prop({ type: String })
    email_secret: string;

    @Prop({ type: SchemaFactory.createForClass(MutualFundDetails), _id: false })
    mutual_fund_details?: MutualFundDetails;
}

type PaymentDocument = HydratedDocument<Payment>;
const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.virtual('account', {
    ref: 'Account',
    localField: 'account_id',
    foreignField: '_id',
    justOne: true,
});

PaymentSchema.virtual('customer', {
    ref: 'Customer',
    localField: 'customer_id',
    foreignField: '_id',
    justOne: true,
});

PaymentSchema.virtual('advisor', {
    ref: 'User',
    localField: 'advisor_id',
    foreignField: '_id',
    justOne: true,
});

export { PaymentDocument, PaymentSchema };
