import { IsDefined } from 'class-validator';

export class GetVerificationOtp {
    @IsDefined()
    phone_number: string;

    @IsDefined()
    phone_code: string;

    @IsDefined()
    customer_id: string;
}
