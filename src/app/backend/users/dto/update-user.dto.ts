import { IsEmail, IsMobilePhone, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsMobilePhone()
    phone_number: string;

    @IsEmail()
    email: string;

    @IsString()
    gender: string;

    @IsString()
    birth_date: string;
}
