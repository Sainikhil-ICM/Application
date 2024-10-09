import { Transform } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class GetPriceDto {
    @IsDefined()
    @Transform(({ value }) => Math.max(1, value))
    units: number;
}
