import { IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class GetUserLinksDto {
    @IsString()
    manager_id: ObjectId;

    @IsString()
    reportee_id: ObjectId;
}
