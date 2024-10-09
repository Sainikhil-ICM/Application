import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { ResourceCategory, ResourceSubCategory } from 'src/constants/resource.const';

export class GetResourcesDto {
    @IsString()
    readonly name?: string;

    @IsEnum(ResourceCategory)
    readonly category?: string;

    @IsEnum(ResourceSubCategory)
    readonly sub_category?: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;
}
