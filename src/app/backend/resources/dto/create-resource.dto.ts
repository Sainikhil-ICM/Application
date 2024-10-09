import {
    ResourceCategory,
    ResourceStatus,
    ResourceSubCategory,
    ResourceType,
} from 'src/constants/resource.const';
import { ArrayMinSize, IsArray, IsDefined, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateResourceDto {
    @IsDefined()
    @IsString()
    name: string;

    @IsDefined()
    @IsEnum(ResourceStatus)
    status: ResourceStatus;

    @IsDefined()
    @IsEnum(ResourceCategory)
    category: ResourceCategory;

    @IsEnum(ResourceSubCategory)
    sub_category: ResourceSubCategory;

    @IsArray()
    // Had to parse the value to JSON because of FormData.
    @Transform(({ value }) => value.split(','), { toClassOnly: true })
    role_group_types: string[];

    @IsDefined()
    @IsEnum(ResourceType)
    type: ResourceType;

    @IsString()
    link: string;
}
