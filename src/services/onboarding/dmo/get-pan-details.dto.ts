import { format } from 'date-fns';

type GetPanDetailsDtoProps = {
    pan_number: string;
    birth_date: string;
    name: string;
    access_token: string;
};

export class GetPanDetailsDto {
    pan: string;
    dob: string;
    name: string;
    product: string;
    accessToken: string;

    constructor(params: GetPanDetailsDtoProps) {
        this.pan = params.pan_number;
        this.dob = format(new Date(params.birth_date), 'dd/MM/yyyy');
        this.name = params.name;
        this.product = 'oroBonds';
        this.accessToken = params.access_token;
    }
}

export type GetPanDetailsResp = {
    pan: string;
    full_name: string;
    category: string;
    status: string;
};
