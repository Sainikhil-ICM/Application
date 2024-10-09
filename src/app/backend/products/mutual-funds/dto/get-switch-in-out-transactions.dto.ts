import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export default class GetSwitchInOutTransactionsDto {
    @IsInt()
    @Min(1)
    @Transform(({ value }) => parseInt(value))
    readonly page = 1;

    @IsInt()
    @Min(1)
    @Transform(({ value }) => parseInt(value))
    readonly limit = 10;

    @IsInt()
    @Min(1924)
    @Transform(({ value }) => parseInt(value))
    readonly date = 2024;
}
