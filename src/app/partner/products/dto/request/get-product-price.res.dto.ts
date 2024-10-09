import { Transform } from 'class-transformer';
import { IsDefined } from 'class-validator';

export class GetProductPriceReqDto {
    @IsDefined()
    @Transform(({ value }) => Math.max(1, value))
    units: number;

    @IsDefined()
    @Transform(({ value }) => Math.max(1, value))
    return_rate: number;
}
