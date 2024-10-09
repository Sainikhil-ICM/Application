import { IsDefined, IsMongoId, MinLength } from 'class-validator';

export class VerifyPaymentConsentOtp {
    @IsDefined()
    @IsMongoId()
    group_id: string;

    @IsDefined()
    @MinLength(4)
    phone_otp: string;
}
