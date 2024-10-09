import {
    ArrayMinSize,
    IsArray,
    IsDefined,
    IsEmail,
    IsEnum,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from 'src/constants/user.const';

class User {
    @IsDefined()
    @IsString()
    readonly name: string;

    @IsDefined()
    @IsEmail()
    readonly email: string;

    @IsDefined()
    @IsEnum(UserRole)
    readonly role: UserRole;

    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    readonly role_group_ids: string[];
}

// TODO: validation errors are going to FallBackExceptionFilter and not able to return child specific errors.
export class CreateUsersDto {
    @Type(() => User)
    @ValidateNested()
    readonly users: User[];
}
