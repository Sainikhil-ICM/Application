import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomerResDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    status: string;

    @Expose()
    phone_code: string;

    @Expose()
    phone_number: string;

    @Expose()
    is_phone_verified: boolean;

    @Expose()
    email: string;

    @Expose()
    pan_number: string;

    @Expose()
    gender: string;

    @Expose()
    income: string;

    @Expose()
    birth_date: string;

    @Expose()
    demat_number: string;

    @Expose()
    address: string;

    @Expose()
    locality: string;

    @Expose()
    district: string;

    @Expose()
    city: string;

    @Expose()
    state: string;

    @Expose()
    pincode: string;

    @Expose()
    country: string;

    @Expose()
    account_type: string;

    @Expose()
    account_number: string;

    @Expose()
    ifsc_code: string;

    @Expose()
    is_bank_verified: boolean;

    @Expose()
    is_consent_given: boolean;

    @Expose()
    is_whatsapp_given: boolean;

    constructor(partial: Partial<CustomerResDto>) {
        Object.assign(this, partial);
    }
}
