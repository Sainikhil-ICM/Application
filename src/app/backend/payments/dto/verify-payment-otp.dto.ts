import { IsDefined, IsString, MinLength } from 'class-validator';

export class VerifyPaymentOtpDto {
    @IsDefined()
    @MinLength(4)
    phone_otp: string;

    @IsDefined()
    @MinLength(4)
    email_otp: string;
}
