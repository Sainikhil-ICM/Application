/**
 * Contains DTOs to be used in the bonds-hyper-verge-service.ts file
 */

import { format } from 'date-fns';
import { IncomeCategory, KycMode, Occupation } from 'src/constants/customer.const';
import {
    CorrespondanceAddress,
    CustomerProfile,
    NomineeGuardian,
} from 'src/models/customer-profile.model';
import UtilityService from 'src/services/utility.service';

// Following types only serve to document the info
// about schema of ICM APIs; not to be used in ICMP
// application code
type IcmBankDetails = {
    number?: string;
    ifsc?: string;
    name?: string;
    verified?: boolean;
};

type IcmDematDetails = {
    number?: string;
    dp_id?: string;
    client_id?: string;
    broker_name?: string;
    dp_name?: string;
};

// conversion: titleized
enum IcmMaritalStatus {
    MARRIED = 'Married',
    UNMARRIED = 'Unmarried',
}

// conversion: complex map
const IcmOccupation: { [key in Occupation]: string } = {
    [Occupation.BUSINESS]: 'Business',
    [Occupation.PROFESSIONAL_GOVERMENT_SECTOR]: 'GovtSector',
    [Occupation.HOUSEWIFE]: 'Housewife',
    [Occupation.OTHERS]: 'NotCategorised',
    [Occupation.PROFESSIONAL_PRIVATE_SECTOR]: 'PrivateSector',
    [Occupation.PROFESSIONAL_PUBLIC_SECTOR]: 'PublicSector',
    [Occupation.RETIRED]: 'Retired',
    [Occupation.SELF_EMPLOYED]: 'SelfEmployed',
};

// conversion: to lower case
enum IcmResidentialStatus {
    RESIDENT_INDIVIDUAL = 'resident_individual',
    NON_RESIDENT_INDIAN = 'non_resident_indian',
}

// conversion: titleize
enum IcmGender {
    MALE = 'Male',
    FEMALE = 'Female',
}

// conversion: complex map
const IcmIncomeCategory: { [key in IncomeCategory]: string } = {
    LT_1_LAKH: 'below1L',
    '1_5_LAKH': 'between1_5L',
    '5_10_LAKH': 'between5_10L',
    '10_25_LAKH': 'between10_25L',
    GT_25_LAKH: 'above25L',
    '25_LAKH_1_CRORE': 'between25_1cr',
    GT_1_CRORE: 'above1cr',
};

/**
 * Converts the CustomerProfile data to the input type of the ICM
 * Full-KYC submit API
 */
export class SubmitFullKycDataDto {
    aml_hits: any[];

    bank_details: IcmBankDetails;

    demat_details: IcmDematDetails;

    email: string;

    marital_status: IcmMaritalStatus;

    father_or_spouse_name: string;

    residential_status: IcmResidentialStatus;

    ckyc_number: string;

    name: string; // full name

    first_name: string;

    middle_name: string;

    last_name: string;

    gender: IcmGender;

    income: string;

    hv_transaction_id: string;

    pan_number: string;

    poa_details?: any;

    phone: string;

    address: CorrespondanceAddress;

    // DD-MM-YYYY
    birth_date: string;

    is_digilocker: boolean;

    occupation: string;

    documents: { [key: string]: string };

    nomineeData: any;

    constructor(data: CustomerProfile) {
        const util = new UtilityService();

        this.aml_hits = data.aml_hits;

        this.bank_details = {
            ifsc: data.bank_account.ifsc_code,
            number: data.bank_account.number,
            verified: !data.documents?.cancelled_cheque,
            name: data.bank_account.name || data.name,
        };

        this.demat_details = {
            broker_name: data.demat_account.broker,
            client_id: data.demat_account.client_id,
            dp_id: data.demat_account.dp_id,
            dp_name: data.demat_account.demat_type,
            number: data.demat_account.number,
        };

        this.email = data.email;

        this.marital_status = util.titleize(data.marital_status);

        this.father_or_spouse_name = data.fathers_name;

        this.residential_status = data.residential_status.toLowerCase() as IcmResidentialStatus;

        this.ckyc_number = data.ckyc_number || '';

        this.name = data.name || '';

        this.first_name = util.splitName(data.name).first;

        this.middle_name = util.splitName(data.name).middle;

        this.last_name = util.splitName(data.name).last;

        this.gender = util.titleize(data.gender);

        this.income = IcmIncomeCategory[data.income_range];

        this.hv_transaction_id = data.transaction_id;

        this.pan_number = data.pan_number;

        this.poa_details =
            {
                name: data.name,
                dob: format(new Date(data.birth_date), 'dd/MM/yyyy'),
                ...data.aadhaar_details,
                image: undefined,
                type: data.documents?.poa_type || 'aadhaar',
            } || {};

        this.phone = data.phone_number;

        this.address = data.correspondance_address;

        // DD-MM-YYYY
        this.birth_date = format(new Date(data.birth_date), 'dd/MM/yyyy');

        this.occupation = IcmOccupation[data.occupation];

        this.is_digilocker = data.kyc_mode === KycMode.DIGILOCKER;

        this.documents = {
            address: data.documents?.poa_document,
            pan: data.documents?.pan_document,
            photo: data.documents?.photo,
            cancelled_cheque: data.documents?.cancelled_cheque,
            signature: data.documents?.signature,
            aof: data.signed_form_link,
        };

        let guardian: NomineeGuardian | undefined;
        if (data.nominees?.length) {
            guardian = data.nominees.find((nominee) => nominee.guardian?.name)?.guardian;
        }
        const nominee1 = data.nominees?.[0];
        const nominee2 = data.nominees?.[1];
        const nominee3 = data.nominees?.[2];

        this.nomineeData = {
            isNomineeAdded: data.nominees?.length ? 'yes' : 'no',
            isGuardianAdded: guardian ? 'yes' : 'no',
            numberOfNomineesAdded: data.nominees?.length.toString(),
            isNominee1UnderAge: data.nominees?.[0]?.guardian?.name ? 'yes' : 'no',
            isNominee2UnderAge: data.nominees?.[1]?.guardian?.name ? 'yes' : 'no',
            isNominee3UnderAge: data.nominees?.[2]?.guardian?.name ? 'yes' : 'no',
            nominee1name: nominee1?.name,
            percentage1: nominee1?.allocation?.toString(),
            relationship1: nominee1?.relation,
            dob1: nominee1?.birth_date,
            otherrelationship1: '',
            address1: '',
            pincode1: '',
            idtype1: '',
            idnum1: '',
            email1: '',
            mobile1: '',
            nominee2name: nominee2?.name,
            percentage2: nominee2?.allocation?.toString(),
            relationship2: nominee2?.relation,
            dob2: nominee2?.birth_date,
            otherrelationship2: '',
            address2: '',
            pincode2: '',
            idtype2: '',
            idnum2: '',
            email2: '',
            mobile2: '',
            nominee3name: nominee3?.name,
            percentage3: nominee3?.allocation?.toString(),
            relationship3: nominee3?.relation,
            dob3: nominee3?.birth_date,
            otherrelationship3: '',
            address3: '',
            pincode3: '',
            idtype3: '',
            idnum3: '',
            email3: '',
            mobile3: '',
            guardianname: guardian?.name || '',
            guardiandob: guardian?.birth_date || '',
            guardianrelationship: guardian?.relation || '',
            guardianotherrelationship: '',
            guardianaddress: '',
            guardianpincode: '',
            guardianidtype: 'pan',
            guardianidnum: guardian?.pan_number || '',
            guardianmobile: '',
            guardianemail: '',
            guardiandocument: '',
        };
    }
}
