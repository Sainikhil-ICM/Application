import { IsDefined } from 'class-validator';

export class GetDematDetailsDto {
    @IsDefined()
    demat_number: string;
}
