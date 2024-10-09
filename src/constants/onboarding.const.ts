import { Gender } from './customer.const';

enum CvlGender {
    M = 'M',
    F = 'F',
}

export interface CvlKycDataResponse {
    APP_POS_CODE: string;
    APP_TYPE: string;
    APP_NO: string;
    APP_DATE: string;
    APP_PAN_NO: string;
    APP_PAN_COPY: string;
    APP_EXMT: string;
    APP_EXMT_CAT: string;
    APP_EXMT_ID_PROOF: string;
    APP_IPV_FLAG: string;
    APP_IPV_DATE: string;
    APP_GEN: CvlGender;
    APP_NAME: string;
    APP_F_NAME: string;
    APP_REGNO: string;
    APP_DOB_DT: string;
    APP_COMMENCE_DT: string;
    APP_NATIONALITY: string;
    APP_OTH_NATIONALITY: string;
    APP_COMP_STATUS: string;
    APP_OTH_COMP_STATUS: string;
    APP_RES_STATUS: string;
    APP_RES_STATUS_PROOF: string;
    APP_UID_NO: string;
    APP_COR_ADD1: string;
    APP_COR_ADD2: string;
    APP_COR_ADD3: string;
    APP_COR_CITY: string;
    APP_COR_PINCD: string;
    APP_COR_STATE: string;
    APP_COR_CTRY: string;
    APP_OFF_NO: string;
    APP_RES_NO: string;
    APP_MOB_NO: string;
    APP_FAX_NO: string;
    APP_EMAIL: string;
    APP_COR_ADD_PROOF: string;
    APP_COR_ADD_REF: string;
    APP_COR_ADD_DT: string;
    APP_PER_ADD1: string;
    APP_PER_ADD2: string;
    APP_PER_ADD3: string;
    APP_PER_CITY: string;
    APP_PER_PINCD: string;
    APP_PER_STATE: string;
    APP_PER_CTRY: string;
    APP_PER_ADD_PROOF: string;
    APP_PER_ADD_REF: string;
    APP_PER_ADD_DT: string;
    APP_INCOME: string;
    APP_OCC: string;
    APP_OTH_OCC: string;
    APP_POL_CONN: string;
    APP_DOC_PROOF: string;
    APP_INTERNAL_REF: string;
    APP_BRANCH_CODE: string;
    APP_MAR_STATUS: string;
    APP_NETWRTH: string;
    APP_NETWORTH_DT: string;
    APP_INCORP_PLC: string;
    APP_OTHERINFO: string;
    APP_ACC_OPENDT: string;
    APP_ACC_ACTIVEDT: string;
    APP_ACC_UPDTDT: string;
    APP_FILLER1: string;
    APP_FILLER2: string;
    APP_FILLER3: string;
    APP_STATUS: string;
    APP_STATUSDT: string;
    APP_ERROR_DESC: string;
    APP_DUMP_TYPE: string;
    APP_DNLDDT: string;
    APP_REMARKS: string;
    APP_KYC_MODE: string;
    APP_UID_TOKEN: string;
    APP_VER_NO: string;
    APP_KRA_INFO: string;
    APP_IOP_FLG: string;
    APP_FATCA_APPLICABLE_FLAG: string;
    APP_FATCA_BIRTH_PLACE: string;
    APP_FATCA_BIRTH_COUNTRY: string;
    APP_FATCA_COUNTRY_RES: string | null;
    APP_FATCA_COUNTRY_CITYZENSHIP: string;
    APP_FATCA_DATE_DECLARATION: string;
    APP_SIGNATURE: string;
}

export const cvlGenderMap: { [key in CvlGender]: Gender } = {
    [CvlGender.M]: Gender.MALE,
    [CvlGender.F]: Gender.FEMALE,
};

export enum CustomerCvlKycStatus {
    NOT_CHECKED_WITH_RESPECTIVE_KRA = 'Not Checked with respective KRA',
    SUBMITTED = 'Submitted',
    KRA_VERIFIED = 'KRA Verified',
    HOLD = 'Hold',
    REJECTED = 'Rejected',
    NOT_AVAILABLE = 'Not available',
    DEACTIVATED = 'Deactivated',
    KRA_VALIDATED = 'KRA Validated',
    EXISTING_KYC_SUBMITTED = 'Existing KYC Submitted',
    EXISTING_KYC_VERIFIED = 'Existing KYC Verified',
    EXISTING_KYC_HOLD = 'Existing KYC hold',
    EXISTING_KYC_REJECTED = 'Existing KYC Rejected',
    KYC_REGISTERED_WITH_CVLMF = 'KYC REGISTERED WITH CVLMF',
    NOT_CHECKED_WITH_MULTIPLE_KRA = 'Not Checked with Multiple KRA',
    INVALID_PAN_NO_FORMAT = 'Invalid PAN NO Format',
}

interface AddressDetails {
    address: string;
    state: string;
    districtOrCity: string;
    pincode: string;
    localityOrPostOffice: string;
    country: string;
}

export interface IcmThirdPartyData {
    userInHypervergeCug: boolean;
    forceKYC: boolean;
    enhancedKycStatus: string;
    isDigioEnabled: boolean;
    email: string;
    signedUpOn: string; // ISO date format
    isReferredUser: boolean;
    name: string;
    phone: string;
    productName: string;
    pan: string;
    gender: string;
    income: string;
    dob: string; // Format: DD-MM-YYYY
    addressDocType: string;
    addressDetails: AddressDetails;
    status: string;
    demat: string;
    accountNumber: string;
    ifscCode: string;
}
