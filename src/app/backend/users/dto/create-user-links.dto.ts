import { IsArray } from 'class-validator';

export class CreateUserLinksDto {
    @IsArray()
    link_ids: string[];
}
