import { IsDefined, Length } from 'class-validator';

export class LoginCustomerDto {
    @IsDefined()
    @Length(10, 10)
    phone_number: string;
}
