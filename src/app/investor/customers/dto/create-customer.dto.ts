import { IsDefined, IsEmail, IsMobilePhone } from 'class-validator';

export class CreateCustomerDto {
    @IsDefined()
    name: string;

    @IsEmail()
    email: string;

    @IsMobilePhone()
    phone_number: string;

    @IsDefined()
    pan_number: string;
}
