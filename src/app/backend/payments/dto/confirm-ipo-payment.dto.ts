import { IsDefined, IsMongoId, IsString } from 'class-validator';

export class ConfirmIpoPaymentDto {
    @IsDefined()
    @IsMongoId()
    group_id: string;

    @IsDefined()
    @IsMongoId()
    customer_id: string;

    @IsDefined()
    @IsMongoId()
    account_id: string;

    @IsDefined()
    @IsString()
    product_isin: string;
}
