import { ObjectId } from 'mongoose';

export enum CustomerKycStatus {
    BASIC_DETAILS_ENTERED = 'BASIC_DETAILS_ENTERED',
    KYC_INITIATED = 'KYC_INITIATED',
    KYC_SUBMITTED = 'KYC_SUBMITTED',
    KYC_VERIFIED = 'KYC_VERIFIED',
    KYC_REJECTED = 'KYC_REJECTED',
    // Admin requested additional or correct info/docs
    // Admin flagged KYC as "on hold"(?) to prevent transactions. Admin can revisit to approve or reject later
}

// export enum CustomerStatus {
//     BASIC_DETAILS_ENTERED = 'Basic Details Entered',
//     KYC_DOCUMENTS_REQUESTED = 'KYC Documents Requested',
//     KYC_DOCUMENTS_SUBMITTED = 'KYC Documents Submitted',
//     KYC_VERIFICATION_PENDING = 'KYC Verification Pending',
//     BANK_DETAILS_REQUESTED = 'Bank Details Requested',
//     BANK_DETAILS_SUBMITTED = 'Bank Details Submitted',
//     KYC_VERIFIED = 'KYC Verified',
//     KYC_REJECTED = 'KYC Rejected',
// }

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export const genderMap = {
    F: Gender.FEMALE,
    M: Gender.MALE,
    O: Gender.OTHER
}

export enum ValidationType {
    CUSTOMER_MANDATE = 'CUSTOMER_MANDATE',
    ASSISTED_KYC = 'ASSISTED_KYC',
}

export enum IncomeCategory {
    'LT_1_LAKH' = 'LT_1_LAKH',
    '1_5_LAKH' = '1_5_LAKH',
    '5_10_LAKH' = '5_10_LAKH',
    '10_25_LAKH' = '10_25_LAKH',
    'GT_25_LAKH' = 'GT_25_LAKH',
    '25_LAKH_1_CRORE' = '25_LAKH_1_CRORE',
    'GT_1_CRORE' = 'GT_1_CRORE',
}

export enum CompanyAddressType {
    BUSINESS = 'BUSINESS',
    REGISTERED_OFFICE = 'REGISTERED_OFFICE',
}

export enum USPerson {
    YES = 'YES',
    NO = 'NO',
}

export enum BeneficialOwnerRelation {
    SHAREHOLDER = 'SHAREHOLDER',
    PROMOTER = 'PROMOTER',
    DIRECTOR = 'DIRECTOR',
    TRUSTEE = 'TRUSTEE',
    PARTNER = 'PARTNER',
}

export enum CitizenshipStatus {
    INDIAN = 'INDIAN',
    OTHER = 'OTHER',
}

export enum CustomerProfileType {
    AKYC = 'AKYC',
    ONBOARDED = 'ONBOARDED',
    INVITED = 'INVITED',
}

export enum CustomerEntityType {
    INDIVIDUAL = 'INDIVIDUAL',
    NON_INDIVIDUAL = 'NON_INDIVIDUAL',
}

export enum CustomerProfileStatus {
    DETAILS_PENDING = 'DETAILS_PENDING',
    REVIEW_PENDING = 'REVIEW_PENDING',
    SUCCESSFUL = 'SUCCESSFUL',
    PAN_VERIFICATION_FAILED = 'PAN_VERIFICATION_FAILED',
    BANK_ACCOUNT_VERIFICATION_FAILED = 'BANK_ACCOUNT_VERIFICATION_FAILED',
    CANCELLED_CHEQUE_OCR_FAILED = 'CANCELLED_CHEQUE_OCR_FAILED',
    GEO_LOCATION_VALIDATION_FAILED = 'GEO_LOCATION_VALIDATION_FAILED',
    SELFIE_VALIDATION_FAILED = 'SELFIE_VALIDATION_FAILED',
    SIGNATURE_VALIDATION_FAILED = 'SIGNATURE_VALIDATION_FAILED',
    ESIGN_FAILED = 'ESIGN_FAILED',
}

export enum AkycErrorPanValidation {
    INVALID_PAN = 'INVALID_PAN',
    PAN_EXISTS = 'PAN_EXISTS',
    NAME_MISMATCH = 'NAME_MISMATCH',
    BIRTH_DATE_MISMATCH = 'BIRTH_DATE_MISMATCH',
    UNKONWN = 'UNKNOWN',
    AML_CHECK_WARNING = 'AML_CHECK_WARNING',
}

export enum MaritalStatus {
    MARRIED = 'MARRIED',
    UNMARRIED = 'UNMARRIED',
    OTHER = 'OTHER',
}

export enum Occupation {
    PROFESSIONAL_PRIVATE_SECTOR = 'PROFESSIONAL_PRIVATE_SECTOR',
    PROFESSIONAL_PUBLIC_SECTOR = 'PROFESSIONAL_PUBLIC SECTOR',
    PROFESSIONAL_GOVERMENT_SECTOR = 'PROFESSIONAL_GOVERMENT_SECTOR',

    SELF_EMPLOYED = 'SELF_EMPLOYED',
    RETIRED = 'RETIRED',
    HOUSEWIFE = 'HOUSEWIFE',
    BUSINESS = 'BUSINESS',
    OTHERS = 'OTHERS',
}

export enum BankAccountType {
    SAVINGS = 'SAVINGS',
    CURRENT = 'CURRENT',
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

export enum NatureOfBusiness {
    AGRICULTURE = 'AGRICULTURE',
    GEMS_AND_JEWELLERY = 'GEMS_AND_JEWELLERY',
    MONEY_LENDING = 'MONEY_LENDING',
    REAL_ESTATE = 'REAL_ESTATE',
    EXPORT_IMPORT = 'EXPORT_IMPORT',
    MANUFACTURING = 'MANUFACTURING',
    SERVICE_INDUSTRY = 'SERVICE_INDUSTRY',
    TRADING_FIRM = 'TRADING_FIRM',
    CASINO_OWNER = 'CASINO_OWNER',
    ARMS_MANUFACTURE = 'ARMS_MANUFACTURE',
    OTHERS = 'OTHERS',
}

export enum UltimateBeneficialOwnerType {
    INDIVIDUAL = 'INDIVIDUAL',
    NON_INDIVIDUAL = 'NON_INDIVIDUAL',
}

export enum ProofOfIdentity {
    COI = 'COI',
    MOA = 'MOA',
    REGISTRATION_CERTIFICATE = 'REGISTRATION_CERTIFICATE',
    PARTNERSHIP_DEED = 'PARTNERSHIP_DEED',
    TRUST_DEED = 'TRUST_DEED',
    RESOLUTION_OF_BOARD = 'RESOLUTION_OF_BOARD',
    'ACTIVITY_PROOF_1_SOLE_PROPRIETORSHIP' = 'ACTIVITY_PROOF_1_SOLE_PROPRIETORSHIP',
    'ACTIVITY_PROOF_2_SOLE_PROPRIETORSHIP' = 'ACTIVITY_PROOF_2_SOLE_PROPRIETORSHIP',
    HUF_DECLARATION_DEED_AND_COPARCENERS = 'HUF_DECLARATION_DEED_AND_COPARCENERS',
}

export enum InstitutionType {
    PRIVATE_LTD = 'PRIVATE_LTD',
    PUBLIC_LTD = 'PUBLIC_LTD',
    PARTNERSHIP = 'PARTNERSHIP',
    TRUST = 'TRUST',
    CHARITIES = 'CHARITIES',
    NGO = 'NGO',
    LLP = 'LLP',
    HUF = 'HUF',
    AOP = 'AOP',
    SOCIETY = 'SOCIETY',
    PROPRIETORSHIP_FIRM = 'PROPRIETORSHIP_FIRM',
    OTHERS = 'OTHERS',
}

export enum ResidentialStatus {
    RESIDENT_INDIVIDUAL = 'RESIDENT_INDIVIDUAL',
    NON_RESIDENT_INDIAN = 'NON_RESIDENT_INDIAN',
}
export enum RelatedPartyType {
    DIRECTOR = 'DIRECTOR',
    PROMOTER = 'PROMOTER',
    KARTA = 'KARTA',
    TRUSTEE = 'TRUSTEE',
    PARTNER = 'PARTNER',
    PROPRIETOR = 'PROPRIETOR',
    BENEFICIARY_OWNER = 'BENEFICIARY_OWNER',
    AUTHORIZED_PERSON = 'AUTHORIZED_PERSON',
    COURT_APPOINTMENT_OFFICIAL = 'COURT_APPOINTMENT_OFFICIAL',
    POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
    OTHERS = 'OTHERS',
}

export enum CustomerProfileType {
    INDIVIDUAL = 'INDIVIDUAL',
    NON_INDIVIDUAL = 'NON_INDIVIDUAL',
}

export enum DematType {
    CDSL = 'CDSL',
    NSDL = 'NSDL',
}

export enum AddressProofType {
    PASSPORT = 'PASSPORT',
    VOTER_ID = 'VOTER_ID',
    AADHAAR = 'AADHAAR',
    DRIVING_LICENSE = 'DRIVING_LICENSE',
    NREGA_JOB_CARD = 'NREGA JOB CARD',
    NATIONAL_POPULATION_REGISTER_LETTER = 'NATIONAL_POPULATION_REGISTER_LETTER',
}

export enum KycMode {
    ONLINE = 'ONLINE',
    DIGILOCKER = 'DIGILOCKER',
    MIN_KYC = 'MIN_KYC',
    SELF = 'SELF',
}

export enum OnboardingType {
    ASSISTED_KYC = 'ASSISTED_KYC',
    MIN_KYC = 'MIN_KYC',
    DIY_KYC = 'DIY_KYC',
}

export const B2CCustomerAttachmentMap = {
    ADDRESS: 'address',
    PAN: 'pan',
    ADDRESS_PROOF: 'address',
    PAN_CARD: 'pan',
    CANCELLED_CHEQUE: 'bank',
};

export type SessionCustomer = {
    sub: string;
    customer_id: ObjectId;
};
