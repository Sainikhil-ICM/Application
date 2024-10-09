import { Type } from 'class-transformer';
import {
    IsDefined,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    MinLength,
} from 'class-validator';
import { ObjectId } from 'mongoose';

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

export class ValidatePanDto {
    @IsDefined()
    @IsString()
    @Matches(/^\b(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}\b$/)
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
    @Length(10)
    phone_number: string;
}

export class VerifyBankDto {
    @IsDefined()
    @IsString()
    transactionId: string;

    @IsDefined()
    @Length(10)
    @IsString()
    @Matches(/^[A-Z]{3}P[A-Z]{1}\d{4}[A-Z]{1}$/)
    pan_number: string;

    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @Type(() => BankAccountDto)
    bank_account: BankAccountDto;

    @IsEnum(MaritalStatus)
    marital_status: MaritalStatus;

    @IsEnum(Gender)
    gender: Gender;

    @IsEnum(Occupation)
    occupation: Occupation;

    @IsString()
    fathers_name: string;

    @IsEnum(CitizenshipStatus)
    citizenship: CitizenshipStatus;

    @IsEnum(ResidentialStatus)
    residential_status: ResidentialStatus;

    // TODO: Remove the params below, as they do not have dependency in the handler.

    @IsString()
    @IsEmail()
    email: string;

    @Length(10)
    @IsString()
    phone_number: string;

    @IsString()
    birth_date: string;

    @IsString()
    ckyc_number: string;

    @IsEnum(IncomeCategory)
    income_range: IncomeCategory;

    @Type(() => NomineeDto)
    nominees: NomineeDto[];

    @IsString()
    cancelled_cheque: string;
}

export class UploadChequeDto {
    @IsDefined()
    @IsString()
    transactionId: string;

    @IsString()
    cancelled_cheque: string;

    @IsDefined()
    @Length(10)
    @IsString()
    @Matches(/^[A-Z]{3}P[A-Z]{1}\d{4}[A-Z]{1}$/)
    pan_number: string;

    // TODO: Remove the params below, as they do not have dependency in the handler.

    @IsString()
    name: string;

    @IsString()
    @IsEmail()
    email: string;

    @Length(10)
    @IsString()
    phone_number: string;

    @IsString()
    birth_date: string;

    @IsString()
    ckyc_number: string;

    @Type(() => NomineeDto)
    nominees: NomineeDto[];

    @Type(() => BankAccountDto)
    bank_account: BankAccountDto;

    @IsEnum(CitizenshipStatus)
    citizenship: CitizenshipStatus;

    @IsString()
    fathers_name: string;

    @IsEnum(IncomeCategory)
    income_range: IncomeCategory;

    @IsEnum(MaritalStatus)
    marital_status: MaritalStatus;

    @IsEnum(Occupation)
    occupation: Occupation;

    @IsEnum(ResidentialStatus)
    residential_status: ResidentialStatus;

    @IsEnum(Gender)
    gender: Gender;
}

export class AddNomineesDto {
    @IsDefined()
    @Type(() => NomineeDto)
    nominees: NomineeDto[];
}

export class SubmitSignedFormDto {
    @IsDefined()
    @IsString()
    customer_id: ObjectId;

    @IsDefined()
    @IsString()
    signed_form_link: string;
}

class AddressDetailsDto {
    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsString()
    @IsOptional()
    districtOrCity: string;

    @IsString()
    @IsOptional()
    pincode: string;

    @IsString()
    @IsOptional()
    localityOrPostOffice: string;

    @IsString()
    @IsOptional()
    country: string;
}

export class ThirdPartyCustomerDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsNotEmpty()
    pan: string;

    @IsString()
    @IsOptional()
    productName: string;

    @IsString()
    @IsOptional()
    gender: string;

    @IsString()
    @IsOptional()
    income: string;

    @IsString()
    @IsOptional()
    dob: string;

    @IsString()
    @IsOptional()
    status: string;

    @IsString()
    @IsOptional()
    demat: string;

    @IsString()
    @IsOptional()
    dpName: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    addressDocType: string;

    @IsString()
    @IsOptional()
    access_token: string;

    @IsOptional()
    addressDetails: AddressDetailsDto;

    @IsString()
    @IsOptional()
    accountNumber: string;

    @IsString()
    @IsOptional()
    ifscCode: string;

    @IsString()
    @IsOptional()
    accountType: string;

    @IsString()
    @IsOptional()
    nameInBank: string;
}
