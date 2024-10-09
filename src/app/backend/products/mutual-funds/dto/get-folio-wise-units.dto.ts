import { IsString } from 'class-validator';

export class GetFolioWiseUnitsDto {
    @IsString()
    readonly amfi_code: string;
}
