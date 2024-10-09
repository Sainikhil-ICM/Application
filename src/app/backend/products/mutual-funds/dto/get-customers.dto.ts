import { Transform } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { ObjectId, Types } from 'mongoose';

export class GetCustomersDto {
    @IsString()
    name: string;

    @Transform(({ value }) => new Types.ObjectId(value))
    account_id: ObjectId;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;
}
