import { format } from 'date-fns';
import { InstitutionType } from 'src/constants/customer.const';
import { CustomerProfileDocument } from 'src/models/customer-profile.model';
import UtilityService from 'src/services/utility.service';

const institutionTypeMap = {
    [InstitutionType.PRIVATE_LTD]: InstitutionType.PRIVATE_LTD,
    [InstitutionType.PUBLIC_LTD]: InstitutionType.PUBLIC_LTD,
    [InstitutionType.PARTNERSHIP]: InstitutionType.PARTNERSHIP,
    [InstitutionType.TRUST]: InstitutionType.TRUST,
    [InstitutionType.CHARITIES]: InstitutionType.TRUST, // this is on purpose according to the AOF
    [InstitutionType.NGO]: InstitutionType.TRUST, // this is on purpose according to the AOF
    [InstitutionType.LLP]: InstitutionType.LLP,
    [InstitutionType.HUF]: InstitutionType.HUF,
    [InstitutionType.AOP]: InstitutionType.AOP,
    [InstitutionType.SOCIETY]: InstitutionType.SOCIETY,
    [InstitutionType.PROPRIETORSHIP_FIRM]: '',
    [InstitutionType.OTHERS]: '',
};

export class NonIndividualOnboardingFormDto {
    splitDate = (date: string) => {
        const formattedDate = format(new Date(date), 'dd/MM/yyyy');
        const [day, month, year] = formattedDate.split('/');
        return {
            day: day || '',
            month: month || '',
            year: year || '',
        };
    };

    previousYear = (date = new Date()) => {
        const previousYearDate = new Date(date);
        previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);

        const formattedYear = previousYearDate.getFullYear().toString().slice(-2);
        return formattedYear;
    };

    present_date = new Date().toISOString();

    'Incorporation Day': string;
    'Incorporation Year': string;
    'Bank Account': string;
    'Turnover Year 2': string;
    'Turnover Year 1': string;
    'Demat Client ID': string;
    'Bank Name': string;
    'Commencement Year': string;
    'Commencement Day': string;
    'Proof Of Address Line 1': string;
    'UBO 1 Country of Birth': string;
    'UBO 2 Country of Birth': string;
    'Proof Of Address Line 2': string;
    'Demat DP ID': string;
    'Proof Of Address District': string;
    'Registered Address District': string;
    'UBO 1 Relation': string;
    'UBO 2 Relation': string;
    'PAN Number': string;
    'Declaration Day': string;
    'Proof Of Address State': string;
    'UBO 1 Country of Residence': string;
    'UBO 2 Country of Residence': string;
    'field_name_61': string;
    'Fatca Name of Entity': string;
    'UBO 1 US Person': string;
    'UBO 2 US Person': string;
    'Status': string;
    'Registered Address Line 3': string;
    'Registered Address Line 2': string;
    'Commencement Month': string;
    'Registration Number': string;
    'Contact Details Name': string;
    'Bank Branch': string;
    'Fatca Address Type': string;
    'Bank IFSC': string;
    'UBO 1 ID': string;
    'UBO 2 ID': string;
    'Ultimate Beneficiary Owner': string;
    'Turnover Value 2': string;
    'Demat DP Provider Name': string;
    'Fatca Place of Incorporation': string;
    'Turnover Value 1': string;
    'Fatca Country of Incorporation': string;
    'Name': string;
    'Proof Of Address City': string;
    'Registered Address Line 1': string;
    'UBO 1 Address': string;
    'UBO 2 Address': string;
    'Tax Resident of Other Country': string;
    'Networth Value 1': string;
    'Networth Value 2': string;
    'Declaration Place': string;
    'Contact Details Email': string;
    'Bank Others': string;
    'field_name_95': string;
    'Incoporation Month': string;
    'UBO 1 Nationality': string;
    'UBO 2 Nationality': string;
    'Fatca PAN': string;
    'UBO 1 DOB': string;
    'UBO 2 DOB': string;
    'Declaration Year': string;
    'Politically Exposed Person': string;
    'UBO 1 Share Percentage': string;
    'UBO 2 Share Percentage': string;
    'UBO 2 Name': string;
    'Contact Details Telephone': string;
    'Registered Address PinCode': string;
    'Fatca Date of Incorporation': string;
    'Proof Of Address Pincode': string;
    'Proof Of Address Country': string;
    'Registered Address Country': string;
    'Contact Details Designation': string;
    'UBO 1 PAN': string;
    'UBO 2 PAN': string;
    'Settlement Agency': string;
    'UBO 1 Name': string;
    'Proof Of Address Line 3': string;
    'Declaration Month': string;
    'Bank Account Type': string;
    'Networth Year 2': string;
    'Networth Year 1': string;
    'field_name_31': string;
    'UBO 2 Father Name': string;
    'UBO 1 Father Name': string;
    'Registered Address State': string;
    'UBO 1 TIN': string;
    'UBO 2 TIN': string;
    'Demat Provider': string;
    'Registered Address City': string;
    'Entity Constitution': string;

    constructor(params: Partial<CustomerProfileDocument>) {
        const util = new UtilityService();
        this['Incorporation Day'] = this.splitDate(params?.birth_date).day;
        this['Incorporation Year'] = this.splitDate(params?.birth_date).year;
        this['Bank Account'] = params.bank_account.number;
        this['Turnover Year 2'] = this.previousYear();
        this['Turnover Year 1'] = this.splitDate(this.present_date).year.slice(-2);
        this['Demat Client ID'] = params.demat_account?.client_id;
        this['Bank Name'] = params.bank_account?.name?.toUpperCase();
        this['Commencement Year'] = this.splitDate(params.company_details.commencement_date).year;
        this['Commencement Day'] = this.splitDate(params.company_details.commencement_date).day;
        this['Proof Of Address Line 1'] = (params.correspondance_address.line_1 || '')
            .substring(0, 37)
            .toUpperCase();
        this['UBO 1 Country of Birth'] = params.ultimate_beneficial_owner[0]?.birth_country;
        this['UBO 2 Country of Birth'] = params.ultimate_beneficial_owner[1]?.birth_country;
        this['Proof Of Address Line 2'] = (
            (params.correspondance_address.line_1 || '').substring(37) +
            (params.correspondance_address.line_2 || '')
        )
            .substring(0, 37)
            .toUpperCase();
        this['Demat DP ID'] = params.demat_account?.dp_id;
        this['Proof Of Address District'] = params.correspondance_address.city.toUpperCase();
        this['Registered Address District'] = params.correspondance_address.city.toUpperCase();
        this['Registered Address City'] = params.correspondance_address.city.toUpperCase();
        this['UBO 1 Relation'] = util.titleize(params.ultimate_beneficial_owner[0]?.relation);
        this['UBO 2 Relation'] = util.titleize(params.ultimate_beneficial_owner[1]?.relation);
        this['PAN Number'] = params.pan_number;
        this['Declaration Day'] = this.splitDate(this.present_date).day;
        this['Proof Of Address State'] = params.correspondance_address.state.toUpperCase();
        this['UBO 1 Country of Residence'] = params.ultimate_beneficial_owner[0]?.residence_country;
        this['UBO 2 Country of Residence'] = params.ultimate_beneficial_owner[1]?.residence_country;
        this['field_name_61'] = 'yes';
        this['Fatca Name of Entity'] = params.name.toUpperCase();
        this['UBO 1 US Person'] = util.titleize(params.ultimate_beneficial_owner[0]?.us_person);
        this['UBO 2 US Person'] = util.titleize(params.ultimate_beneficial_owner[1]?.us_person);
        this['Institution Type'] = institutionTypeMap[params.company_details?.institution_type];
        this['Instituition Type Other'] = !institutionTypeMap[
            params.company_details?.institution_type
        ]
            ? params.company_details?.institution_type === InstitutionType.OTHERS
                ? params.company_details?.institution
                : params.company_details?.institution_type
            : '';
        this['Registered Address Line 3'] = (
            (params.correspondance_address.line_2 || '').substring(37) +
            (params.correspondance_address.line_3 || '')
        )
            .substring(0, 37)
            .toUpperCase();
        this['Registered Address Line 2'] = (
            (params.correspondance_address.line_1 || '').substring(37) +
            (params.correspondance_address.line_2 || '')
        )
            .substring(0, 37)
            .toUpperCase();
        this['Commencement Month'] = this.splitDate(params.company_details.commencement_date).month;
        this['Registration Number'] = params.company_details.registration;
        this['Contact Details Name'] = params.related_party_details[0]?.name.toUpperCase();
        this['Bank Branch'] = '';
        this['Fatca Address Type'] = params.correspondance_address.address_type;
        this['Bank IFSC'] = params.bank_account.ifsc_code;
        this['UBO 1 ID'] = util.titleize(params.ultimate_beneficial_owner[0]?.id_doc_type);
        this['UBO 2 ID'] = util.titleize(params.ultimate_beneficial_owner[1]?.id_doc_type);
        this['Ultimate Beneficiary Owner'] = [
            InstitutionType.HUF,
            InstitutionType.PROPRIETORSHIP_FIRM,
        ].includes(params.company_details.institution_type)
            ? 'NO'
            : 'YES';
        this['Turnover Value 2'] = params.company_details.previous_year_turnover;
        this['Demat DP Provider Name'] = params.demat_account?.broker;
        this['Fatca Place of Incorporation'] = params.company_details.place?.toUpperCase();
        this['Turnover Value 1'] = params.company_details.present_year_turnover;
        this['Fatca Country of Incorporation'] =
            params.correspondance_address.country?.toUpperCase();
        this['Name'] = params.name.toUpperCase();
        this['Proof Of Address City'] = params.correspondance_address.city.toUpperCase();
        this['Registered Address Line 1'] = (params.correspondance_address.line_1 || '')
            .substring(0, 37)
            .toUpperCase();
        this['UBO 1 Address'] = params.ultimate_beneficial_owner[0]?.address;
        this['UBO 2 Address'] = params.ultimate_beneficial_owner[1]?.address;
        this['Tax Resident of Other Country'] = 'NO';
        this['Networth Value 1'] = params.company_details.present_year_networth;
        this['Networth Value 2'] = params.company_details.previous_year_networth;
        this['Declaration Place'] = params.correspondance_address.city.toUpperCase();
        this['Contact Details Email'] = params.related_party_details[0].email;
        this['Contact Details Phone'] = params.related_party_details[0].phone_number;
        this['Bank Others'] = '';
        this['Entity Constitution'] = params.company_details.institution_type;
        this['Incoporation Month'] = this.splitDate(params?.birth_date).month;
        this['UBO 1 Nationality'] = params.ultimate_beneficial_owner[0]?.nationality;
        this['UBO 2 Nationality'] = params.ultimate_beneficial_owner[1]?.nationality;
        this['Fatca PAN'] = params.pan_number;
        this['UBO 1 DOB'] = params.ultimate_beneficial_owner?.[0]?.birth_date
            ? format(new Date(params.ultimate_beneficial_owner?.[0]?.birth_date), 'dd/MM/yyyy')
            : '';
        this['UBO 2 DOB'] = params.ultimate_beneficial_owner?.[1]?.birth_date
            ? format(new Date(params.ultimate_beneficial_owner?.[1]?.birth_date), 'dd/MM/yyyy')
            : '';
        this['Declaration Year'] = this.splitDate(this.present_date).year;
        this['Politically Exposed Person'] = 'NO';
        this['UBO 1 Share Percentage'] = params.ultimate_beneficial_owner[0]?.ownership;
        this['UBO 2 Share Percentage'] = params.ultimate_beneficial_owner[1]?.ownership;
        this['UBO 2 Name'] = params?.ultimate_beneficial_owner[1]?.name?.toUpperCase();
        this['Contact Details Telephone'] = params.related_party_details[0].telephone_number;
        this['Registered Address PinCode'] = params.correspondance_address.pin_code;
        this['Fatca Date of Incorporation'] = format(new Date(params?.birth_date), 'ddMMyyyy');
        this['Proof Of Address Pincode'] = params.correspondance_address.pin_code;
        this['Proof Of Address Country'] = params.correspondance_address.country?.toUpperCase();
        this['Registered Address Country'] = params.correspondance_address.country?.toUpperCase();
        this['Contact Details Designation'] = params.related_party_details[0].party_type;
        this['UBO 1 PAN'] = params.ultimate_beneficial_owner[0]?.pan_number;
        this['UBO 2 PAN'] = params.ultimate_beneficial_owner[1]?.pan_number;
        this['Settlement Agency'] = 'NCL,ICCL';
        this['UBO 1 Name'] = params.ultimate_beneficial_owner[0]?.name;
        this['Proof Of Address Line 3'] = (
            (params.correspondance_address.line_2 || '').substring(37) +
            (params.correspondance_address.line_3 || '')
        )
            .substring(0, 37)
            .toUpperCase();
        this['Declaration Month'] = this.splitDate(this.present_date).month;
        this['Bank Account Type'] = params.bank_account.type;
        this['Networth Year 2'] = this.previousYear();
        this['Networth Year 1'] = this.splitDate(this.present_date).year.slice(-2);
        this['field_name_31'] = '';
        this['UBO 2 Father Name'] = params.ultimate_beneficial_owner[1]?.father_name;
        this['UBO 1 Father Name'] = params.ultimate_beneficial_owner[0]?.father_name;
        this['Registered Address State'] = params.correspondance_address.state.toUpperCase();
        this['UBO 1 TIN'] = params.ultimate_beneficial_owner[0]?.tin;
        this['UBO 2 TIN'] = params.ultimate_beneficial_owner[1]?.tin;
        this['Demat Provider'] = params.demat_account?.demat_type;
    }
}
