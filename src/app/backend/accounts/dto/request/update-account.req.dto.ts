import { IsDefined, IsString } from 'class-validator';

export class UpdateAccountReqDto {
    @IsDefined()
    @IsString()
    name: string;
}
