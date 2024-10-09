import { IsDefined } from 'class-validator';

export class UpdateBankAccountDto {
    @IsDefined()
    name: string;

    @IsDefined()
    number: string;

    @IsDefined()
    ifsc_code: string;

    @IsDefined()
    address: string;
}
