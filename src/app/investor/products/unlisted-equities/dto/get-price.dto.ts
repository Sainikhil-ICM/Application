import { Transform } from 'class-transformer';
import { IsDefined, IsString } from 'class-validator';

export default class GetPriceDto {
    @IsDefined()
    @Transform(({ value }) => Math.max(1, value))
    units: number;

    @IsDefined()
    @IsString()
    trade_date: string;
}
