import { IsString, IsDefined, IsMobilePhone } from 'class-validator';

export class UpdateUserReqDto {
    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @IsString()
    phone_code: string;

    @IsDefined()
    @IsMobilePhone()
    phone_number: string;
}
