import { IsDefined, Length } from 'class-validator';

export class VerifyOtpDto {
    @IsDefined()
    @Length(10, 10)
    phone_number: string;

    @IsDefined()
    @Length(4, 4)
    otp: string;
}
