import { IsBoolean, IsDefined, IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreatePaymentReqDto {
    @IsString()
    @IsMongoId()
    customer_id: string;

    @IsDefined()
    @IsString()
    product_isin: string;

    @IsDefined()
    @IsNumber()
    units: number;

    @IsDefined()
    @IsNumber()
    return_rate: number;

    // @IsDefined()
    // @IsNumber()
    // unit_price: number;

    // @IsDefined()
    // @IsNumber()
    // user_amount: number;

    @IsDefined()
    @IsBoolean()
    is_consent_given: boolean;
}
