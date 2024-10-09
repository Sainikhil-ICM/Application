import {
    IsDefined,
    IsEmail,
    IsEnum,
    IsMobilePhone,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Gender, IncomeCategory } from 'src/constants/customer.const';
import { ProductType } from 'src/constants/product.const';

export class CreateCustomerReqDto {
    @IsString()
    @IsDefined()
    @Matches(/^[A-Za-z0-9]{10}$/, { message: 'Invalid pan number' })
    pan_number: string;

    @IsString()
    @IsDefined()
    name: string;

    @IsEmail()
    @IsDefined()
    email: string;

    @IsMobilePhone()
    @IsDefined()
    phone_number: string;

    @IsString()
    @IsDefined()
    @Matches(/^[A-Za-z0-9]{16}$/, { message: 'Invalid demat number' })
    demat_number: string;

    @IsEnum(ProductType)
    @IsDefined()
    product_type: ProductType;

    @IsDefined()
    @IsEnum(IncomeCategory)
    income: IncomeCategory;

    @IsDefined()
    @IsEnum(Gender)
    gender: Gender;

    @IsString()
    @IsDefined()
    @Matches(/^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/, {
        message: 'Required date format (dd/mm/yyyy)',
    })
    birth_date: string;

    @IsString()
    @IsDefined()
    @MinLength(6, { message: 'must be at least 6 digits.' })
    @MaxLength(18, { message: 'must be at most 18 digits.' })
    @Matches(/^\d+$/, { message: 'expecting only digits.' })
    account_number: string;

    @IsString()
    @IsDefined()
    @Matches(/^[A-Za-z0-9]{11}$/, { message: 'Invalid code' })
    ifsc_code: string;

    @IsString()
    @IsDefined()
    address: string;

    @IsString()
    @IsDefined()
    locality: string;

    @IsString()
    @IsDefined()
    city: string;

    @IsString()
    @IsDefined()
    state: string;

    @IsString()
    @IsDefined()
    country: string;

    @IsString()
    @IsDefined()
    pincode: string;

    @IsString()
    @IsDefined()
    phone_code: string;

    @IsString()
    @IsDefined()
    type: string;

    @IsString()
    @IsDefined()
    location: string;
}
