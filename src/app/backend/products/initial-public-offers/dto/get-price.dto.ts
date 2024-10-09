import { Transform } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export class GetPriceDto {
    @IsDefined()
    @Transform(({ value }) => Math.max(1, value))
    units: number;

    @IsDefined()
    @Transform(({ value }) => Math.max(1, value))
    return_rate: number;
}
