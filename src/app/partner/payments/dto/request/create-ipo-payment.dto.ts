import { ArrayMinSize, IsArray, IsDefined, IsMongoId, IsString } from 'class-validator';

export class CreateIpoPaymentDto {
    @IsMongoId()
    customer_id: string;

    @IsString()
    customer_upi: string;

    @IsDefined()
    @IsString()
    group_isin: string;

    @IsArray()
    @ArrayMinSize(1)
    product_series: {
        isin: string;
        name: string;
        code: string;
        issuer: string;
        units: number;
        unit_price: number;
        user_amount: number;
    }[];
}
