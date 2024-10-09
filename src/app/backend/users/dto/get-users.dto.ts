import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { UserRole, UserStatus } from 'src/constants/user.const';

export class GetUsersDto {
    @IsEnum(UserStatus)
    readonly status: UserStatus;

    @IsString()
    readonly name: string;

    @IsEnum(UserRole)
    readonly role: UserRole;

    @IsString()
    readonly role_group: string;

    @IsInt()
    @Transform(({ value }) => {
        if (+value === 0) return 0;
        const valueInMilliseconds = +value * 60 * 60 * 1000;
        return new Date().getTime() - valueInMilliseconds;
    })
    readonly hours_ago: number;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;
}
