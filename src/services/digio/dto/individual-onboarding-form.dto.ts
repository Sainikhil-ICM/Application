import { format } from 'date-fns';
import { AddressProofType } from 'src/constants/customer.const';
import { CustomerProfileDocument } from 'src/models/customer-profile.model';
import UtilityService from 'src/services/utility.service';

type Image = {
    content: string;
    type: string;
};

export class IndividualOnboardingFormDto {
    splitName = (name: string) => {
        const nameSplit = name.split(' ');
        return {
            first: nameSplit[0],
            middle: nameSplit.slice(1, -1).join(' '),
            last: nameSplit.length > 1 ? nameSplit.at(-1) : '',
        };
    };

    // Page : 1
    'KYC Checklist': string;

    // Page : 4
    'Prefix Name': string;
    'KYC Number': string;
    'First Name': string;
    'Middle Name': string;
    'Last Name': string;
    'Maiden Prefix Name': string;
    'Maiden First Name': string;
    'Maiden Middle Name': string;
    'Maiden Last Name': string;
    'Father/Spouse Prefix Name': string;
    'Father/Spouse First Name': string;
    'Father/Spouse Middle Name': string;
    'Father/Spouse Last Name': string;
    'Mother Prefix Name': string;
    'Mother First Name': string;
    'Mother Middle Name': string;
    'Mother Last Name': string;
    'Birth Date': string;
    'Others Country': string;
    'Country Code': string;
    'Application Type': string;
    'KYC Type': string;
    'KYC Mode': string;
    'Gender': string;
    'Marital Status': string;
    'Citizanship': string;
    'Residential Status': string;
    'Occupation Type': string;

    // Page : 5
    'Net Worth In INR In Lakhs': string;
    'Current Address': string;
    'Current Address Line1': string;
    'Current Address Line2': string;
    'Current Address Line3': string;
    'Current City': string;
    'Current Zip Code': string;
    'Current District': string;
    'Current State/UT Code': string;
    'Current State/UT': string;
    'Current Country': string;
    'Current Country Code': string;
    'Passport Number': string;
    'Voter ID Card': string;
    'Driving License': string;
    'NREGA Job Card': string;
    'Aadhaar Card': string;
    'National Population Register Letter': string;
    'Passport Expiry Date': string;
    'Driving License Expiry Date': string;
    'Identification Number': string;
    'Net Worth as on': string;
    'Gross Annual Income Details In INR': string;
    'Politically Exposed Person': string;
    'Current Address Type': string;
    'POA Type': string;

    // Page : 6
    'Permanent Address': string;
    'Permanent Line1': string;
    'Permanent Line2': string;
    'Permanent Line3': string;
    'Permanent City': string;
    'Permanent Zip': string;
    'Permanent District': string;
    'Permanent State/UT Code': string;
    'Permanent State/UT': string;
    'Permanent Country': string;
    'Office Number': string;
    'Email ID': string;
    'Mobile Number': string;
    'Permanent Address Type': string;
    'Permanent Address Same as Current': string;

    // Page : 8
    'Bank Account Type': string;
    'Bank NRI Account': string;
    'Bank Name': string;
    'Bank Account Number': string;
    'Bank IFSC Code': string;
    'Bank MICR Code': string;
    'Bank Address': string;
    'Depository Name': string;
    'Depository ID': string;
    'Depository Client ID': string;

    constructor(params: Partial<CustomerProfileDocument>) {
        const util = new UtilityService();
        // Page : 1
        this['KYC Checklist'] =
            'Pan Card,Photograph,Proof of Identity,Permanent Address,Bank Proof';

        // Page : 4
        this['Prefix Name'] = '';
        this['KYC Number'] = params.ckyc_number;
        this['First Name'] = this.splitName(params.name).first;
        this['Middle Name'] = this.splitName(params.name).middle;
        this['Last Name'] = this.splitName(params.name).last;
        this['Maiden Prefix Name'] = '';
        this['Maiden First Name'] = '';
        this['Maiden Middle Name'] = '';
        this['Maiden Last Name'] = '';
        this['Father/Spouse Prefix Name'] = '';
        this['Father/Spouse First Name'] = this.splitName(params.fathers_name).first;
        this['Father/Spouse Middle Name'] = this.splitName(params.fathers_name).middle;
        this['Father/Spouse Last Name'] = this.splitName(params.fathers_name).last;
        this['Mother Prefix Name'] = '';
        this['Mother First Name'] = '';
        this['Mother Middle Name'] = '';
        this['Mother Last Name'] = '';
        this['Birth Date'] = format(new Date(params.birth_date), 'dd/MM/yyyy');
        this['Others Country'] = '';
        this['Country Code'] = '';
        this['Application Type'] = params.ckyc_number ? 'update' : 'new';
        this['KYC Type'] = 'normal';
        this['KYC Mode'] = params.kyc_mode;
        this['Gender'] = params.gender ? util.titleize(params.gender) : '';
        this['Marital Status'] = params.marital_status ? util.titleize(params.marital_status) : '';
        this['Citizenship'] = 'Indian';
        this['Residential Status'] = params.residential_status
            ? util.titleize(params.residential_status)
            : '';
        this['Occupation Type'] = params.occupation ? util.titleize(params.occupation) : '';
        this['PAN Number'] = params.pan_number;

        // Page : 5
        this['Net Worth In INR In Lakhs'] = ''; //
        this['Current Address'] = '';
        this['Current Address Line1'] = params.correspondance_address?.line_1;
        this['Current Address Line2'] = params.correspondance_address?.line_2;
        this['Current Address Line3'] = params.correspondance_address?.line_3;
        this['Current City'] = params.correspondance_address?.city;
        this['Current Zip Code'] = params.correspondance_address?.pin_code;
        this['Current District'] = '';
        this['Current State/UT Code'] = '';
        this['Current State/UT'] = params.correspondance_address?.state;
        this['Current Country'] = 'India';
        this['Current Country Code'] = 'IN';
        this['Passport Number'] =
            params.documents?.poa_type === AddressProofType.PASSPORT
                ? '(Document Attached at the End)'
                : '';
        this['Voter ID Card'] =
            params.documents?.poa_type === AddressProofType.VOTER_ID
                ? '(Document Attached at the End)'
                : '';
        this['Driving License'] =
            params.documents?.poa_type === AddressProofType.DRIVING_LICENSE
                ? '(Document Attached at the End)'
                : '';
        this['NREGA Job Card'] =
            params.documents?.poa_type === AddressProofType.NREGA_JOB_CARD
                ? '(Document Attached at the End)'
                : '';
        this['Aadhaar Card'] =
            params.documents?.poa_type === AddressProofType.AADHAAR
                ? '(Document Attached at the End)'
                : '';
        this['National Population Register Letter'] =
            params.documents?.poa_type === AddressProofType.NREGA_JOB_CARD
                ? '(Document Attached at the End)'
                : '';
        this['Passport Expiry Date'] = '';
        this['Driving License Expiry Date'] = '';
        this['Identification Number'] = '';
        this['Net Worth as on'] = '';
        this['Gross Annual Income Details In INR'] = params.income_range;
        this['Politically Exposed Person'] = 'No';
        this['Current Address Type'] = 'Residential Or Business';
        this['POA Type'] = params.documents?.poa_type
            ? util.titleize(params.documents.poa_type)
            : '';
        this['Permanent Address Same as Current'] = 'Yes';
        this['Permanent Address'] = '';
        this['Permanent Line1'] = '';
        this['Permanent Line2'] = '';
        this['Permanent Line3'] = '';
        this['Permanent City'] = '';
        this['Permanent Zip'] = '';
        this['Permanent District'] = '';
        this['Permanent State/UT Code'] = '';
        this['Permanent State/UT'] = '';
        this['Permanent Country'] = '';
        this['Office Number'] = params.company_details?.telephone_number;
        this['Email ID'] = params.email;
        this['Mobile Number'] = params.phone_number;
        this['Permanent Address Type'] = '';
        this['Tax Resident'] = 'Tax Resident of India';

        // Page : 8
        this['Bank Account Type'] = params.bank_account.type
            ? util.titleize(params.bank_account.type)
            : '';
        this['Bank NRI Account'] = '';
        this['Bank Name'] = ''; //
        this['Bank Account Number'] = params.bank_account.number;
        this['Bank IFSC Code'] = params.bank_account.ifsc_code;
        this['Bank MICR Code'] = ''; //
        this['Bank Address'] = '';
        this['Depository Name'] = params.demat_account?.demat_type; //
        this['Depository ID'] = params.demat_account?.dp_id; //
        this['Depository Client ID'] = params.demat_account?.client_id; //

        // Page : 9
        this['Opt Nominee Yes'] = params.nominees?.length ? 'Yes' : 'No';
        this['Nominee 1 Name'] = params.nominees?.[0]?.name;
        this['Nominee 2 Name'] = params.nominees?.[1]?.name;
        this['Nominee 3 Name'] = params.nominees?.[2]?.name;
        this['Nominee 1 Allocation'] = params.nominees?.[0]?.allocation;
        this['Nominee 2 Allocation'] = params.nominees?.[1]?.allocation;
        this['Nominee 3 Allocation'] = params.nominees?.[2]?.allocation;
        this['Nominee 1 Relation'] = params.nominees?.[0]?.relation
            ? util.titleize(params.nominees?.[0]?.relation)
            : '';
        this['Nominee 2 Relation'] = params.nominees?.[1]?.relation
            ? util.titleize(params.nominees?.[1]?.relation)
            : '';
        this['Nominee 3 Relation'] = params.nominees?.[2]?.relation
            ? util.titleize(params.nominees?.[2]?.relation)
            : '';
        this['Nominee 1 DOB'] = params.nominees?.[0]?.birth_date
            ? format(new Date(params.nominees?.[0]?.birth_date), 'dd/MM/yyyy')
            : '';
        this['Nominee 2 DOB'] = params.nominees?.[1]?.birth_date
            ? format(new Date(params.nominees?.[1]?.birth_date), 'dd/MM/yyyy')
            : '';
        this['Nominee 3 DOB'] = params.nominees?.[2]?.birth_date
            ? format(new Date(params.nominees?.[2]?.birth_date), 'dd/MM/yyyy')
            : '';
        this['Nominee 1 Guardian Name'] = params.nominees?.[0]?.guardian?.name;
        this['Nominee 2 Guardian Name'] = params.nominees?.[1]?.guardian?.name;
        this['Nominee 3 Guardian Name'] = params.nominees?.[2]?.guardian?.name;
        this['Nominee 1 Guardian Relation'] = params.nominees?.[0]?.guardian?.relation
            ? util.titleize(params.nominees?.[0]?.guardian?.relation)
            : '';
        this['Nominee 2 Guardian Relation'] = params.nominees?.[1]?.guardian?.relation
            ? util.titleize(params.nominees?.[1]?.guardian?.relation)
            : '';
        this['Nominee 3 Guardian Relation'] = params.nominees?.[2]?.guardian?.relation
            ? util.titleize(params.nominees?.[2]?.guardian?.relation)
            : '';
        this['Nominee 1 Guardian PAN'] = params.nominees?.[0]?.guardian?.pan_number;
        this['Nominee 2 Guardian PAN'] = params.nominees?.[1]?.guardian?.pan_number;
        this['Nominee 3 Guardian PAN'] = params.nominees?.[2]?.guardian?.pan_number;
        this['Nominee 1 Guardian PAN Check'] = params.nominees?.[0]?.guardian?.pan_number
            ? 'Yes'
            : '';
        this['Nominee 2 Guardian PAN Check'] = params.nominees?.[1]?.guardian?.pan_number
            ? 'Yes'
            : '';
        this['Nominee 3 Guardian PAN Check'] = params.nominees?.[2]?.guardian?.pan_number
            ? 'Yes'
            : '';
        this['Opt Nominee No'] = params.nominees?.length ? 'No' : 'Yes';
        this['Full Name'] = params.name;
        this['Date'] = params.date ? format(new Date(params.date), 'dd/MM/yyyy') : '';
        this['Place'] = params.place;
    }
}

export class OnboardingFormImagesDto {
    'Photo': Image;
    'Signature': Image;
    'Proof of Identification Photo': Image;
    'PAN Card Photo': Image;
    'Bank Account Proof Photo': Image;

    constructor(params: Partial<CustomerProfileDocument>) {
        this['Photo'] = {
            content: params.documents.photo,
            type: params.documents.photo.slice(-3).toLowerCase() === 'png' ? 'PNG' : 'JPEG',
        };
        this['Signature'] = {
            content: params.documents.signature,
            type: params.documents.signature.slice(-3).toLowerCase() === 'png' ? 'PNG' : 'JPEG',
        };
        this['Proof of Identification Photo'] = {
            content: params.documents.poa_document,
            type: params.documents.poa_document.slice(-3).toLowerCase() === 'png' ? 'PNG' : 'JPEG',
        };
        this['PAN Card Photo'] = {
            content: params.documents.pan_document,
            type: params.documents.pan_document.slice(-3).toLowerCase() === 'png' ? 'PNG' : 'JPEG',
        };
        this['Bank Account Proof Photo'] = params.documents.cancelled_cheque
            ? {
                  content: params.documents.cancelled_cheque,
                  type:
                      params.documents.cancelled_cheque.slice(-3).toLowerCase() === 'png'
                          ? 'PNG'
                          : 'JPEG',
              }
            : {
                  content:
                      'https://assets.partner.incredmoney.com/public/images/customers/account-verified-penny-drop.png',
                  type: 'PNG',
              };
    }

    async resolveImages(imageUrlToBase64: (url: string) => Promise<string>) {
        this['Photo'].content = await imageUrlToBase64(this['Photo'].content);
        this['Signature'].content = await imageUrlToBase64(this['Signature'].content);
        this['Proof of Identification Photo'].content = await imageUrlToBase64(
            this['Proof of Identification Photo'].content,
        );
        this['PAN Card Photo'].content = await imageUrlToBase64(this['PAN Card Photo'].content);
        this['Bank Account Proof Photo'].content = await imageUrlToBase64(
            this['Bank Account Proof Photo'].content,
        );
    }

    toJson() {
        return {
            Photo: this['Photo'],
            Signature: this['Signature'],
            'Proof of Identification Photo': this['Proof of Identification Photo'],
            'PAN Card Photo': this['PAN Card Photo'],
            'Bank Account Proof Photo': this['Bank Account Proof Photo'],
        };
    }
}
