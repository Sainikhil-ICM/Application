import { IsDefined, IsMongoId } from 'class-validator';

export class SendPaymentConsentOtp {
    @IsDefined()
    @IsMongoId()
    group_id: string;

    @IsDefined()
    @IsMongoId()
    customer_id: string;
}
