import { ArrayMinSize, IsArray, IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateUserProductGroupDto {
    @IsDefined()
    @IsString()
    product_isin: string;

    @IsDefined()
    @IsString()
    group_name: string;

    @IsNumber()
    max_return_rate: number;

    @IsNumber()
    min_price_deviation: number;

    @IsNumber()
    max_price_deviation: number;

    @IsArray()
    @ArrayMinSize(1)
    user_product_ids: string[];
}
