import { Transform } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';

export class GetCustomersReqDto {
    @IsString()
    name: string;

    @IsString()
    status: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    page: number;

    @IsInt()
    @Transform(({ value }) => parseInt(value))
    per_page: number;
}
