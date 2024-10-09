import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { ProductCategory, ProductListingCategory } from 'src/constants/product.const';

export default class GetProductsDto {
    @IsEnum(ProductCategory)
    category: ProductCategory;

    @IsEnum(ProductListingCategory)
    listing: ProductListingCategory;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;

    @IsString()
    isin: string;
}
