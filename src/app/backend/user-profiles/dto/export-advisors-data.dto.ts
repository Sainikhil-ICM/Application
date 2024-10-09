import { ArrayMinSize, IsArray, IsDefined } from 'class-validator';

export class ExportUsersDto {
    @IsArray()
    @IsDefined()
    user_ids: string[];
}
