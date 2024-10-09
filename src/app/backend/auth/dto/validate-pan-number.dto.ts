import { IsDefined } from 'class-validator';

export class ValidatePanNumberDto {
    @IsDefined()
    pan_number: string;

    @IsDefined()
    name: string;

    @IsDefined()
    birth_date: string;
}
