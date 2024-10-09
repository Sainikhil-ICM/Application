import { IsDefined, IsEmail, IsEnum, IsMobilePhone, IsString } from 'class-validator';
import { CompanyAddressType, Gender, KycMode } from 'src/constants/customer.const';
import { ProductType } from 'src/constants/product.const';

export class CreateCustomerDto {
    @IsDefined()
    pan_number: string;

    @IsDefined()
    name: string;

    @IsEmail()
    email: string;

    @IsMobilePhone()
    phone_number: string;

    @IsString()
    demat_number?: string;

    @IsEnum(ProductType)
    product_type: ProductType;

    @IsEnum(KycMode)
    kyc_mode: KycMode;

    @IsString()
    birth_date: string;

    @IsEnum(Gender)
    gender?: Gender;

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
