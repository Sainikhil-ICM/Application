import { genderMap } from 'src/constants/customer.const';
import { IcmThirdPartyData, cvlGenderMap } from 'src/constants/onboarding.const';
import { Customer } from 'src/models';
import { CustomerProfile } from 'src/models/customer-profile.model';

export class IcmThirdPartyDataTransformToProfile {
    fathers_name: string;
    all_details_filled: boolean;
    correspondance_address: any;
    pan_number: string;
    phone_number: string;
    name: string;
    gender: string;
    email: string;
    transaction_id: string;

    constructor(icmThirdPartyData: IcmThirdPartyData) {
        this.correspondance_address = {
            line_1: icmThirdPartyData.addressDetails?.address,
            line_2: '',
            line_3: '',
            city: icmThirdPartyData.addressDetails?.districtOrCity,
            state: icmThirdPartyData.addressDetails?.state,
            pin_code: icmThirdPartyData.addressDetails?.pincode,
            country: 'India',
        };
        this.pan_number = icmThirdPartyData.pan || '';
        this.phone_number = icmThirdPartyData.phone
            ? icmThirdPartyData.phone.slice(icmThirdPartyData.phone.length - 10)
            : '';
        this.name = icmThirdPartyData.name || '';
        this.gender = genderMap[icmThirdPartyData.gender] || '';
        this.email = icmThirdPartyData.email || '';
        this.transaction_id = 'cvl-fetched';
    }
}

export class IcmThirdPartyDataTransformToCustomer {
    pan_number: string;
    phone_number: string;
    name: string;
    gender: string;
    email: string;

    constructor(icmThirdPartyData: IcmThirdPartyData) {
        this.pan_number = icmThirdPartyData.pan || '';
        this.phone_number = icmThirdPartyData.phone
            ? icmThirdPartyData.phone.slice(icmThirdPartyData.phone.length - 10)
            : '';
        this.name = icmThirdPartyData.name || '';
        this.gender = genderMap[icmThirdPartyData.gender] || '';
        this.email = icmThirdPartyData.email || '';
    }
}
