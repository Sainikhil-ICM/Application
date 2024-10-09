import {
    IsString,
    IsEmail,
    IsDefined,
    IsMobilePhone,
    IsMongoId,
    MinLength,
    IsEnum,
} from 'class-validator';
import { UserRole } from 'src/constants/user.const';

export class CreateUserDto {
    @IsMongoId()
    role_group_id: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsMongoId()
    manager_id: string;

    @MinLength(10, { message: 'pan_number should be of 10 characters long' })
    @IsString()
    pan_number: string;

    @MinLength(4)
    @IsString()
    name: string;

    @IsDefined()
    @IsEmail()
    email: string;

    @IsDefined()
    @IsString()
    phone_code: string;

    @IsDefined()
    @IsString()
    birth_date: string;

    @IsDefined()
    @IsMobilePhone()
    phone_number: string;
}
