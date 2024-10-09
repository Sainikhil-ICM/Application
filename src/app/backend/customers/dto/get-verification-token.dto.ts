import { IsDefined, IsEnum, IsMongoId } from 'class-validator';
import { Gender, IncomeCategory } from 'src/constants/customer.const';

export class VerificationTokenDto {
    @IsDefined()
    @IsMongoId()
    customer_id: string;

    @IsDefined()
    @IsEnum(IncomeCategory)
    income: IncomeCategory;

    @IsEnum(Gender)
    gender: Gender;

    @IsDefined()
    birth_date: string;

    @IsDefined()
    demat_number: string;

    @IsDefined()
    account_number: string;

    @IsDefined()
    ifsc_code: string;
}
