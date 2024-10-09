import { Gender } from 'src/constants/customer.const';
import { ConnectionType } from 'src/models';

const incomeCategoryMap = {
    LT_1_LAKH: '1',
    '1_5_LAKH': '2',
    '5_10_LAKH': '3',
    '10_25_LAKH': '4',
    GT_25_LAKH: '5',
};

type UpdateCustomerDmoProps = {
    connection_type: ConnectionType;
    access_token: string;
    name: string;
    pan_number: string;
    gender: string;
    income: string;
    birth_date: string;
    demat_number: string;
    account_number: string;
    ifsc_code: string;
    address: string;
    state: string;
    city: string;
    pincode: string;
    locality: string;
    country: string;
};

export class UpdateCustomerDmo {
    connectionType: ConnectionType;
    accessToken: string;
    productName: string;
    name: string;
    pan: string;
    gender: string;
    income: string;
    dob: string;
    demat: string;
    accountNumber: string;
    ifscCode: string;
    addressDocType: string;
    addressDetails: {
        address: string;
        state: string;
        districtOrCity: string;
        pincode: string;
        localityOrPostOffice: string;
        country: string;
    };

    constructor(updateCustomerDmo: Partial<UpdateCustomerDmoProps>) {
        this.connectionType = updateCustomerDmo.connection_type;
        this.accessToken = updateCustomerDmo.access_token;
        this.productName = 'oroBonds';
        this.name = updateCustomerDmo.name;
        this.pan = updateCustomerDmo.pan_number;
        this.gender = updateCustomerDmo.gender == Gender.MALE ? 'M' : 'F';
        this.income = incomeCategoryMap[updateCustomerDmo.income];
        this.dob = new Date(updateCustomerDmo.birth_date).toISOString();
        this.demat = updateCustomerDmo.demat_number;
        this.accountNumber = updateCustomerDmo.account_number;
        this.ifscCode = updateCustomerDmo.ifsc_code;
        this.addressDocType = 'address';
        this.addressDetails = {
            address: updateCustomerDmo.address,
            state: updateCustomerDmo.state,
            districtOrCity: updateCustomerDmo.city,
            pincode: updateCustomerDmo.pincode,
            localityOrPostOffice: updateCustomerDmo.locality,
            country: updateCustomerDmo.country,
        };
    }
}

export type UpdateCustomerResp = {
    // foreign_id: string;
    // access_token: string;
    // access_token_expires_at: Date;
    // api_token: string;
    // is_existing_customer: boolean;
};
