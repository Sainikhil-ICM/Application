import { Transform } from 'class-transformer';
import { IsString, IsInt, IsEnum, IsOptional } from 'class-validator';

export class GetAccountUsersReqDto {
    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;

    @IsString()
    start_date;

    @IsString()
    end_date?: string;

    @IsString()
    user_id?: string;
}
