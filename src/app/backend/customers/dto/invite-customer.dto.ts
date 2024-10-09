import { IsDefined, IsEmail, IsMobilePhone, IsString, IsEnum } from 'class-validator';
import { CompanyAddressType } from 'src/constants/customer.const';

export class InviteCustomerDto {
    @IsDefined()
    name: string;

    @IsEmail()
    email: string;

    @IsDefined()
    phone_code: string;

    @IsMobilePhone()
    phone_number: string;

    @IsDefined()
    pan_number: string;

    @IsDefined()
    birth_date: string;

    @IsString()
    address?: string;

    @IsString()
    city?: string;

    @IsString()
    state?: string;

    @IsString()
    pincode?: string;

    @IsString()
    country?: string;

    @IsEnum(CompanyAddressType)
    address_type?: CompanyAddressType;

    @IsString()
    account_type?: string;

    @IsString()
    account_number?: string;

    @IsString()
    ifsc_code?: string;
}
