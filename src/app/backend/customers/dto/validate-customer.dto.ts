import { IsNotEmpty, IsString, IsBoolean, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Gender, IncomeCategory } from 'src/constants/customer.const';

export class ValidateCustomerDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    phone_code: string;

    @IsNotEmpty()
    @IsString()
    phone_number: string;

    @IsBoolean()
    is_phone_verified: boolean;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsEnum(IncomeCategory)
    income: IncomeCategory;

    @IsString()
    birth_date: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    pincode: string;

    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    account_type: string;

    @IsString()
    account_number: string;

    @IsString()
    ifsc_code: string;

    @IsBoolean()
    is_bank_verified: boolean;

    @IsBoolean()
    is_penny_dropped: boolean;

    @IsString()
    api_token: string;

    @IsBoolean()
    is_consent_given: boolean;
}
