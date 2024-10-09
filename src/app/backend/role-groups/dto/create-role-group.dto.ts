import { IsDefined, IsEnum, IsString, MinLength } from 'class-validator';
import { AccessControlList } from 'src/constants/access-control.const';

export class CreateRoleGroupDto {
    @IsDefined()
    @IsString()
    @MinLength(3, { message: 'Name is too short.' })
    name: string;

    @IsDefined()
    @IsString()
    @MinLength(3, { message: 'Description is too short.' })
    description: string;

    @IsDefined()
    @IsEnum(AccessControlList, { each: true })
    roles: AccessControlList[];
}
