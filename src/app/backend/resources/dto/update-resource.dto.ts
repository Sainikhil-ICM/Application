import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import {
    ResourceCategory,
    ResourceStatus,
    ResourceSubCategory,
    ResourceType,
} from 'src/constants/resource.const';

export class UpdateResourceDto {
    @IsString()
    name: string;

    @IsEnum(ResourceStatus)
    status: ResourceStatus;

    @IsEnum(ResourceCategory)
    category: ResourceCategory;

    @IsEnum(ResourceSubCategory)
    sub_category: ResourceSubCategory;

    @IsArray()
    @ArrayMinSize(1)
    // Had to parse the value to JSON because of FormData.
    @Transform(({ value }) => value.split(','), { toClassOnly: true })
    role_group_types: string[];

    @IsEnum(ResourceType)
    type: ResourceType;

    @IsString()
    link: string;
}
