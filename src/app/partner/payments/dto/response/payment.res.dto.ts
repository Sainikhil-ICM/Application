import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class PaymentResDto {
    @Expose()
    id: string;

    @Expose({ name: 'trxn_date' })
    ordered_at: string;

    @Expose()
    customer_email: string;

    @Expose()
    customer_name: string;

    @Expose()
    customer_upi: string;

    @Expose()
    status: string;

    @Expose()
    date: string;

    @Expose()
    demat_number: string;

    // Depository participant
    @Expose()
    dp_name: string;

    @Expose()
    payment_mode: string;

    // TODO: required: true, check in webhook
    @Expose()
    product_code: string;

    // TODO: required: true, check in webhook
    @Expose()
    product_name: string;

    // TODO: required: true, check in webhook
    @Expose()
    product_isin: string;

    @Expose()
    product_type: string;

    // TODO: required: true, check in webhook
    @Expose()
    product_issuer: string;

    @Expose()
    type: string;

    @Expose()
    message: string;

    @Expose()
    unit_price: number;

    @Expose()
    units: number;

    @Expose()
    user_amount: number;

    @Expose()
    // Recording customer consent
    is_consent_given: boolean;

    @Expose({ name: 'payment_link' })
    eSigningUrl: string;

    @Expose()
    @Transform(({ obj }) => String(obj.customer_id))
    customer_id: string;

    @Expose()
    @Transform(({ obj }) => String(obj.advisor_id))
    advisor_id: string;

    @Expose()
    @Transform(({ obj }) => String(obj.account_id))
    account_id: string;

    constructor(partial: Partial<PaymentResDto>) {
        Object.assign(this, partial);
    }
}
