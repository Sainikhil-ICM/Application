import { IsDefined, MinLength } from 'class-validator';

export class VerifyOtpReqDto {
    @IsDefined()
    @MinLength(4)
    phone_otp: string;
}
