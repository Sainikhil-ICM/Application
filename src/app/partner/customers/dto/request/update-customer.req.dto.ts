import { IsEnum, IsMobilePhone, IsOptional, IsString, Matches } from 'class-validator';
import { Gender, IncomeCategory } from 'src/constants/customer.const';

export class UpdateCustomerReqDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsMobilePhone()
    @IsOptional()
    phone_number: string;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Za-z0-9]{10}$/, { message: 'Invalid pan number' })
    pan_number: string;

    @IsOptional()
    @IsEnum(Gender)
    gender: Gender;

    @IsOptional()
    @IsEnum(IncomeCategory)
    income: IncomeCategory;

    @IsString()
    @IsOptional()
    birth_date: string;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Za-z0-9]{16}$/, { message: 'Invalid demat number' })
    demat_number: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{0,18}$/, { message: 'Invalid account number' })
    account_number: string;

    @IsString()
    @IsOptional()
    account_type: string;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Za-z0-9]{11}$/, { message: 'Invalid code' })
    ifsc_code: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    locality: string;

    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsString()
    @IsOptional()
    country: string;

    @IsString()
    @IsOptional()
    pincode: string;

    @IsString()
    @IsOptional()
    location: string;
}
