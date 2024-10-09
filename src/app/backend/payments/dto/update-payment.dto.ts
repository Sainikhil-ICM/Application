import { IsDefined, IsEnum, IsString } from 'class-validator';

export class UpdatePaymentDto {
    @IsString()
    payment_mode: string;

    @IsString()
    bank_id: string;

    @IsString()
    upi_id: string;

    @IsString()
    utr_number: string;
}
