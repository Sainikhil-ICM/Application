import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsEnum,
    IsString,
    IsUUID,
    Length,
    Matches,
    MinLength,
} from 'class-validator';
import {
    BankAccountType,
    CitizenshipStatus,
    Gender,
    GuardianRelationship,
    IncomeCategory,
    MaritalStatus,
    NomineeRelation,
    Occupation,
    ResidentialStatus,
} from 'src/constants/customer.const';

export class AkycVerifyPanDto {
    @IsDefined()
    @IsString()
    birth_date: string;

    @IsDefined()
    @IsString()
    @MinLength(3)
    name: string;

    @IsDefined()
    @Length(10)
    @IsString()
    @Matches(/^[A-Z]{3}P[A-Z]{1}\d{4}[A-Z]{1}$/)
    pan_number: string;

    @IsDefined()
    @IsString()
    transactionId: string;

    @IsDefined()
    @IsString()
    @IsEmail()
    email: string;

    @IsDefined()
    @IsString()
    phone_number: string;
}

export class AkycVerifyBankAccountDto {
    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @IsString()
    ifsc_code: string;

    @IsDefined()
    @IsString()
    account_number: string;

    @IsDefined()
    @IsString()
    transactionId: string;

    @IsDefined()
    @Length(10)
    @IsString()
    @Matches(/^[A-Z]{3}P[A-Z]{1}\d{4}[A-Z]{1}$/)
    pan_number: string;
}

export class AkycVerifyCancelledChequeDto {
    @IsDefined()
    @IsString()
    ifsc_code: string;

    @IsDefined()
    @IsString()
    account_number: string;

    @IsDefined()
    @IsString()
    transactionId: string;

    @IsDefined()
    @IsString()
    cancelled_cheque: string;

    @IsDefined()
    @Length(10)
    @IsString()
    @Matches(/^[A-Z]{3}P[A-Z]{1}\d{4}[A-Z]{1}$/)
    pan_number: string;
}

class BankAccountDto {
    @IsString()
    number: string;

    @IsEnum(BankAccountType)
    type: BankAccountType;

    @IsString()
    ifsc: string;

    verified: boolean;

    @IsString()
    demat_account_number: string;

    @IsString()
    name: string;
}

class GuardianDto {
    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @IsString()
    birth_date: string;

    @IsEnum(GuardianRelationship)
    relationship: GuardianRelationship;
}

class NomineeDto {
    @IsString()
    name: string;

    @IsString()
    birth_date: string;

    @IsEnum(NomineeRelation)
    relationship: NomineeRelation;

    @IsString()
    allocation: string;

    @IsString()
    address: string;

    @IsString()
    pincode: string;

    @Type(() => GuardianDto)
    guardian: GuardianDto;
}

export class AkycSubmitCustomerProfileDto {
    @IsString()
    transactionId: string;

    @IsString()
    @IsEmail()
    email: string;

    @Length(10)
    @IsString()
    phone_number: string;

    @Length(10)
    @IsString()
    @Matches(/^[A-Z]{3}P[A-Z]{1}\d{4}[A-Z]{1}$/)
    pan_number: string;

    @IsString()
    name: string;

    @IsString()
    birth_date: string;

    @IsString()
    ckyc_number: string;

    @IsEnum(MaritalStatus)
    marital_status: MaritalStatus;

    @IsEnum(Gender)
    gender: Gender;

    @IsEnum(IncomeCategory)
    income_range: IncomeCategory;

    @IsEnum(Occupation)
    occupation: Occupation;

    @IsString()
    fathers_name: string;

    @IsEnum(CitizenshipStatus)
    citizenship: CitizenshipStatus;

    @IsEnum(ResidentialStatus)
    residential_status: ResidentialStatus;

    @Type(() => BankAccountDto)
    bank_account: BankAccountDto;

    @Type(() => NomineeDto)
    nominees: NomineeDto[];

    @IsString()
    cancelled_cheque: string;
}

export class AkycGetCustomerProfileQueryDto {
    @IsDefined()
    @IsString()
    customer_id: string;
}

export class AkycDigilockerRequestDto {
    @IsDefined()
    @IsString()
    customer_id: string;

    @IsBoolean()
    reset?: boolean;
}

export class AkycValidateSelfieDto {
    @IsDefined()
    @IsString()
    customer_id: string;

    @IsDefined()
    @IsString()
    transaction_id: string;
}

export class AkycCustomerRejectKycDto {
    @IsDefined()
    @IsString()
    customer_id: string;

    @IsDefined()
    @IsString()
    discrepency: string;
}
