import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetCustomerTxnsDto {
    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    per_page = 10;
}
