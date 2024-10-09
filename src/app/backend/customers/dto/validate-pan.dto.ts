import { IsDefined } from 'class-validator';

export class ValidatePanDto {
    @IsDefined()
    pan_number: string;

    @IsDefined()
    name: string;

    @IsDefined()
    birth_date: string;
}
