import { IsDefined, IsEnum, IsString } from 'class-validator';

export class UpdatePaymentStatusDto {
    @IsDefined()
    @IsEnum({ ACCEPT: 'ACCEPT', REJECT: 'REJECT' })
    ops_status: string;

    @IsString()
    ops_remark: string;
}
