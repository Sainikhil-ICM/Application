import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export default class GetTaxFillingDto {
    @IsInt()
    @Min(1924)
    @Transform(({ value }) => parseInt(value))
    readonly year = 2024;
}
