import { IsString, IsBoolean, IsEnum } from 'class-validator';
import { CompanyAddressType, Gender, IncomeCategory, ResidentialStatus } from 'src/constants/customer.const';

export class UpdateCustomerDto {
    @IsEnum(IncomeCategory)
    income: IncomeCategory;

    @IsEnum(ResidentialStatus)
    residential_status: ResidentialStatus;

    @IsEnum(Gender)
    gender: Gender;

    @IsString()
    birth_date: string;

    @IsString()
    demat_number: string;

    @IsString()
    address: string;

    @IsString()
    locality: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    country: string;

    @IsEnum(CompanyAddressType)
    address_type?: CompanyAddressType;

    @IsString()
    pincode: string;

    @IsString()
    bank_account_no: string;

    @IsString()
    ifsc_code: string;

    @IsString()
    phone_code: string;

    @IsBoolean()
    is_whatsapp_given: boolean;

    @IsString()
    account_number: string;
}
