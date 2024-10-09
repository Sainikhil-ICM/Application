import { IsDefined } from 'class-validator';

export class UpdateAddressDto {
    @IsDefined()
    address: string;

    @IsDefined()
    city: string;

    @IsDefined()
    pin_code: string;

    @IsDefined()
    state: string;
}
