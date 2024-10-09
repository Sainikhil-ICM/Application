import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsEnum,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    ValidateNested,
} from 'class-validator';
import {
    AumCategory,
    ClientBase,
    GrossAnnualIncome,
    RelationType,
    ProductType,
    UtmMedium,
    Gender,
    UserProfileStatus,
} from 'src/constants/user-profile.const';

class ArnDto {
    @IsString()
    @Matches(/^[a-zA-Z0-9]{23}$/, { message: 'Invalid ARN number.' })
    arn_number: string;

    @IsString()
    @Matches(/^[a-zA-Z]\d{6}$/, { message: 'Invalid EUIN number.' })
    euin_number: string;

    @IsString()
    euin_validity: Date;

    @IsString()
    euin_document: string;
}

class PmsDto {
    @IsString()
    nism_21a_number: string;

    @IsString()
    nism_21a_validity: Date;

    @IsString()
    nism_21a_document: string;
}

class BankAccountDto {
    @IsString()
    type: string;

    @IsString()
    number: Date;

    @IsString()
    ifsc_code: string;

    @IsString()
    branch: string;

    @IsString()
    bank_name: string;

    @IsString()
    document: string;
}

class GstDto {
    @IsString()
    number: string;

    @IsString()
    state: string;

    @IsString()
    document: string;
}

class AddressDto {
    @IsString()
    house_number: string;

    @IsString()
    street: string;

    @IsString()
    @Matches(/^\d{6}$/)
    pin_code: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    country: string;
}

class EmployeeRelativeDto {
    name: string;

    relation: RelationType;

    other_relation: string;
}

class GuardianDto {
    @IsString()
    name: string;

    @IsString()
    @Matches(/^[A-Z]{5}\d{4}[A-Z]{1}$/, { message: 'Invalid PAN number.' })
    pan_number: string;

    @IsEnum(RelationType)
    relation: RelationType;
}

class NomineeDto {
    @IsString()
    name: string;

    @IsString()
    birth_date: Date;

    @IsNumber()
    allocation: number;

    @IsEnum(RelationType)
    relation: RelationType;

    // @ValidateNested()
    @Type(() => GuardianDto)
    guardian: GuardianDto;

    @IsString()
    _nominee_address: string;

    // @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}

class ContactDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsPhoneNumber()
    phone_number: string;

    @IsString()
    can_send_comms: string;
}

class IncorporationDto {
    @IsString()
    date: Date;

    @IsString()
    document: string;

    @IsString()
    place: string;
}

class RegistrationDto {
    @IsString()
    date: Date;

    @IsString()
    number: string;
}

class SignatoryDto {
    @IsString()
    name: string;

    @IsString()
    @Matches(/^[A-Z]{5}\d{4}[A-Z]{1}$/, { message: 'Invalid PAN number.' })
    pan_number: string;

    @IsString()
    din_number: string;

    @IsString()
    @Matches(/^\d{12}$/, { message: 'Invalid Aadhaar number.' })
    aadhaar_number: string;

    @IsString()
    photo: string;

    @IsString()
    pep: string;
}

class KartaOrCoparcenerDto {
    @IsString()
    name: string;

    @IsString()
    @Matches(/^[A-Z]{5}\d{4}[A-Z]{1}$/, { message: 'Invalid PAN card format' })
    pan_number: string;

    @IsString()
    @Matches(/^\d{12}$/, { message: 'Invalid Aadhar format' })
    aadhaar_number: string;

    @IsString()
    photo: string;

    @IsString()
    pep: string;
}

export class UpdateUserProfileDto {
    @IsString()
    birth_date: Date;

    @IsString()
    photo: string;

    @IsString()
    signature: string;

    @IsString()
    occupation: string;

    @IsString()
    other_occupation: string;

    // @IsString()
    // @Matches(/^\d{6}$/)
    // pin_code: string;

    // @IsString()
    // city: string;

    // @IsString()
    // state: string;

    @IsEnum(Gender)
    gender: Gender;

    @IsString()
    _arn_holder: string;

    @IsString()
    _pms_certfied: string;

    @IsString()
    _gst_registered: string;

    @IsString()
    _registered_address: string;

    @IsBoolean()
    is_consent_given: boolean;

    @IsString()
    _is_nominee: string;

    @IsString()
    _is_employee_relative: string;

    // @IsString()
    // country: string;

    @IsEnum(AumCategory)
    aum_category: AumCategory;

    @IsEnum(UtmMedium)
    utm_medium: UtmMedium;

    @IsEnum(ClientBase, { each: true })
    client_base: ClientBase[];

    @IsEnum(ProductType, { each: true })
    product_types: ProductType[];

    // @ValidateNested()
    @Type(() => ArnDto)
    arn: ArnDto;

    // @ValidateNested()
    @Type(() => PmsDto)
    pms: PmsDto;

    // @ValidateNested()
    @Type(() => BankAccountDto)
    bank_account: BankAccountDto;

    // @ValidateNested()
    @Type(() => GstDto)
    gst: GstDto;

    // @ValidateNested({ each: true })
    @Type(() => NomineeDto)
    nominees: NomineeDto[];

    // @ValidateNested()
    @Type(() => IncorporationDto)
    incorporation: IncorporationDto;

    // @ValidateNested()
    @Type(() => RegistrationDto)
    registration: RegistrationDto;

    @Type(() => EmployeeRelativeDto)
    employee_relative: EmployeeRelativeDto;

    @IsString()
    cob_date: Date;

    @IsString()
    board_resolution: string;

    @IsString()
    memorandum_of_association: string;

    @IsString()
    article_of_association: string;

    @IsString()
    firm_deed: string;

    @IsString()
    firm_resolution: string;

    @IsString()
    trust_deed: string;

    @IsString()
    karta_identity_proof: string;

    @IsString()
    karta_address_proof: string;

    @IsEnum(GrossAnnualIncome)
    gross_annual_income: GrossAnnualIncome;

    @IsString()
    net_worth: string;

    // @ValidateNested({ each: true })
    @Type(() => ContactDto)
    contacts: ContactDto[];

    // @ValidateNested()
    @Type(() => AddressDto)
    correspondence_address: AddressDto;

    // @ValidateNested()
    @Type(() => AddressDto)
    registered_address: AddressDto;

    // @ValidateNested({ each: true })
    @Type(() => SignatoryDto)
    directors: SignatoryDto[];

    // @ValidateNested({ each: true })
    @Type(() => SignatoryDto)
    signatories: SignatoryDto[];

    @ValidateNested()
    @Type(() => KartaOrCoparcenerDto)
    karta: KartaOrCoparcenerDto;

    @ValidateNested({ each: true })
    @Type(() => KartaOrCoparcenerDto)
    coparceners: KartaOrCoparcenerDto[];

    @IsString()
    remarks: string;

    @IsEnum(UserProfileStatus)
    status: UserProfileStatus;
}
