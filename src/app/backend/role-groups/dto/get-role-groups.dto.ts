import { Transform } from 'class-transformer';
import { IsEnum, IsInt } from 'class-validator';
import { AccessControlList } from 'src/constants/access-control.const';

export class GetRoleGroupsDto {
    @IsEnum(AccessControlList)
    permissions: AccessControlList;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;
}
