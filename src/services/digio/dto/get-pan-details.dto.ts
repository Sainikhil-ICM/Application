import { format } from 'date-fns';

type GetPanDetailsDtoProps = {
    pan_number: string;
    name: string;
    birth_date: string;
};

export class GetPanDetailsDto {
    id_no: string;
    name: string;
    dob: string;

    constructor(params: GetPanDetailsDtoProps) {
        this.id_no = params.pan_number;
        this.name = params.name;
        this.dob = params.birth_date;
    }
}
