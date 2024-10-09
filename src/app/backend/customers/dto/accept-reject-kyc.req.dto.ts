import { IsDefined, IsOptional } from 'class-validator';

export class AcceptRejectKYCDto {
    @IsDefined()
    action: string;

    @IsOptional()
    type: string;

    @IsOptional()
    remarks: string;
}
