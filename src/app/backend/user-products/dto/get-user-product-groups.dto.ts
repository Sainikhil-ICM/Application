import { Transform } from 'class-transformer';
import { IsDefined, IsInt, IsString } from 'class-validator';

export class GetUserProductGroupsDto {
    @IsDefined()
    @IsString()
    product_isin: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;
}
