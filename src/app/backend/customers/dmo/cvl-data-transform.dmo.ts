import { cvlGenderMap, CvlKycDataResponse } from 'src/constants/onboarding.const';

export class CvlDataTransformToProfile {
    fathers_name: string;
    all_details_filled: boolean;
    correspondance_address: any;
    pan_number: string;
    phone_number: string;
    name: string;
    gender: string;
    email: string;
    transaction_id: string;

    constructor(cvlResponse: CvlKycDataResponse) {
        this.fathers_name = cvlResponse.APP_F_NAME;
        this.correspondance_address = {
            line_1: cvlResponse.APP_COR_ADD1,
            line_2: cvlResponse.APP_COR_ADD2,
            line_3: cvlResponse.APP_COR_ADD3,
            city: cvlResponse.APP_COR_CITY,
            state: cvlResponse.APP_COR_STATE,
            pin_code: cvlResponse.APP_COR_PINCD,
            country: 'India',
        };
        this.all_details_filled = true;
        this.pan_number = cvlResponse.APP_PAN_NO;
        this.phone_number = cvlResponse.APP_MOB_NO;
        this.name = cvlResponse.APP_NAME;
        this.gender = cvlGenderMap[cvlResponse.APP_GEN];
        this.email = cvlResponse.APP_EMAIL;
        this.transaction_id = 'cvl-fetched';
    }
}

export class CvlDataTransformToCustomer {
    pan_number: string;
    phone_number: string;
    name: string;
    gender: string;
    email: string;

    constructor(cvlResponse: CvlKycDataResponse) {
        this.pan_number = cvlResponse.APP_PAN_NO;
        this.phone_number = cvlResponse.APP_MOB_NO;
        this.name = cvlResponse.APP_NAME;
        this.gender = cvlGenderMap[cvlResponse.APP_GEN];
        this.email = cvlResponse.APP_EMAIL;
    }
}
