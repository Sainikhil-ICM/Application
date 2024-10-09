import { IsDefined, IsString, MinLength } from 'class-validator';

export class VerifyCustomerConsentDto {
    @IsDefined()
    @MinLength(4)
    phone_otp: string;

    @MinLength(4)
    email_otp: string;

    @IsString()
    to_validate: string;
}
