import { IsDefined, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateUserLogDto {
    @IsString()
    @IsDefined()
    record_id: string;

    @IsString()
    @IsDefined()
    record_collection: string;

    @IsString()
    @IsDefined()
    record_action: string;

    // @IsString()
    // @IsOptional()
    // record_before: string;

    // @IsString()
    // @IsOptional()
    // record_after: string;

    @IsString()
    @IsDefined()
    user_id: ObjectId;

    @IsString()
    @IsDefined()
    account_id: ObjectId;
}
