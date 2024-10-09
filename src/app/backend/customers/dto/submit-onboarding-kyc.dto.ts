import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsString } from 'class-validator';
import {
    AddressProofType,
    BankAccountType,
    BeneficialOwnerRelation,
    CitizenshipStatus,
    CompanyAddressType,
    CustomerProfileType,
    Gender,
    IncomeCategory,
    InstitutionType,
    MaritalStatus,
    NatureOfBusiness,
    ProofOfIdentity,
    RelatedPartyType,
    ResidentialStatus,
    UltimateBeneficialOwnerType,
    USPerson,
} from 'src/constants/customer.const';
import { UserProfileType } from 'src/constants/user-profile.const';

class BasicDetailsDto {
    fathers_name: string;
    gender: Gender;
    marital_status: MaritalStatus;
    citizenship: CitizenshipStatus;
    residential_status: string;
    occupation_type: string;
    gross_annual_income: IncomeCategory;
}

class Declaration {
    is_pep: boolean;

    is_tax_resident: boolean;
}

class CorrespondanceAddress {
    line_1: string;
    line_2: string;
    line_3: string;
    pin_code: string;
    city: string;
    state: string;
    country: string;
    address_type: CompanyAddressType;
    type: string;
    document: string;
    pan_document: string;
    photo: string;
}

class BankAccount {
    type: BankAccountType;
    number: string;
    ifsc_code: string;
    document: string;
    name: string;
}

class DematAccount {
    number: string;
}

export enum NomineeRelation {
    FATHER = 'FATHER',
    MOTHER = 'MOTHER',
    SISTER = 'SISTER',
    BROTHER = 'BROTHER',
    SON = 'SON',
    DAUGHTER = 'DAUGHTER',
    SPOUSE = 'SPOUSE',
    OTHERS = 'OTHERS',
}

export enum GuardianRelationship {
    FATHER = 'FATHER',
    MOTHER = 'MOTHER',
    SISTER = 'SISTER',
    BROTHER = 'BROTHER',
    OTHERS = 'OTHERS',
}

class GuardianDto {
    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @IsString()
    birth_date: string;

    @IsEnum(GuardianRelationship)
    relation: GuardianRelationship;

    @IsDefined()
    @IsString()
    pan_number: string;
}

class Nominee {
    name: string;
    birth_date: string;
    allocation: string;
    relation: NomineeRelation;
    other_relation: string;
    guardian: GuardianDto;
}

export class CustomerCompanyDetails {
    place: string;
    tin?: string;
    registration?: string;
    gst_registration?: string;
    institution_type: InstitutionType;
    institution?: string;
    poi: ProofOfIdentity;
    commencement_date: string;
    telephone_number: string;
    fax?: string;
    nature_of_business: NatureOfBusiness;
    present_year_networth: string;
    previous_year_networth: string;
    present_year_turnover: string;
    previous_year_turnover: string;
}

export class CustomerRelatedParty {
    party_type: RelatedPartyType;
    other_party_type?: string;
    din_company?: string;
    din_llp: string;
    aadhaar_number?: string;
    name: string;
    pan_number: string;
    gender: Gender;
    father_name: string;
    residential_status: ResidentialStatus;
    nationality: string;
    line_1: string;
    line_2?: string;
    line_3?: string;
    pin_code: string;
    city: string;
    state: string;
    phone_number: string;
    telephone_number?: string;
    fax?: string;
    email: string;
    is_pep: string; // This could be boolean if you handle conversion elsewhere
    is_tax_resident: string; // This could be boolean if you handle conversion elsewhere
}

export class UltimateBeneficialOwner {
    type: UltimateBeneficialOwnerType;

    name: string;

    address: string;

    father_name: string;

    birth_date: string;

    birth_country: string;

    residence_country: string;

    pan_number: string;

    us_person: USPerson;

    id_doc_type: string;

    id_doc: string;

    relation: BeneficialOwnerRelation;

    tin: string;

    nationality: string;

    ownership: string;
}

export class FatcaDeclaration {
    is_org: 'true' | 'false' = 'false';
    exchange_name?: string;
    is_tax_resident: 'true' | 'false' = 'false';
    is_fin_institution: 'true' | 'false' = 'false';
    is_entity_not_indian: 'true' | 'false' = 'false';
    giin?: string;
}

export class Documents {
    poa_type?: AddressProofType;
    poa_document?: string;
    pan_document?: string;
    photo?: string;
    signature?: string;
}

export class KeyMemberDetails {
    name: string;
    pan_number: string;
    designation: string;
}

export class SubmitOnboardingKycDto {
    @IsEnum(CustomerProfileType)
    type: CustomerProfileType;

    @IsString()
    @IsDefined()
    customer_id: string;

    @IsString()
    @IsDefined()
    name: string;

    @IsString()
    @IsDefined()
    email: string;

    @IsString()
    @IsDefined()
    phone_number: string;

    @IsString()
    @IsDefined()
    pan_number: string;

    @IsString()
    @IsDefined()
    birth_date: string;

    @Type(() => BasicDetailsDto)
    basic_details: BasicDetailsDto;

    @Type(() => Declaration)
    declaration: Declaration;

    @Type(() => CorrespondanceAddress)
    correspondance_address: CorrespondanceAddress;

    @Type(() => BankAccount)
    bank_account: BankAccount;

    @Type(() => DematAccount)
    demat_account: DematAccount;

    _is_nominee: boolean;

    @Type(() => Nominee)
    nominees: Nominee[];

    @IsEnum(UserProfileType)
    profileType: UserProfileType;

    @Type(() => CustomerCompanyDetails)
    company_details: CustomerCompanyDetails;

    @Type(() => CustomerRelatedParty)
    related_party_details: CustomerRelatedParty[];

    @Type(() => UltimateBeneficialOwner)
    ultimate_beneficial_owner: UltimateBeneficialOwner[];

    @Type(() => KeyMemberDetails)
    key_member_details: KeyMemberDetails[];

    @Type(() => FatcaDeclaration)
    fatca_declaration: FatcaDeclaration;

    @Type(() => Documents)
    documents?: Documents;
}
