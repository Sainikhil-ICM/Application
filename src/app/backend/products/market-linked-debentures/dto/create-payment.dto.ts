import { IsDefined, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreatePaymentDto {
    @IsString()
    message: string;

    @IsDefined()
    @IsMongoId()
    customer_id: ObjectId;

    // @IsDefined()
    // @IsString()
    // product_code: string;

    // @IsDefined()
    // @IsString()
    // product_name: string;

    // @IsDefined()
    // @IsString()
    // product_type: string;

    @IsDefined()
    @IsString()
    isin: string;

    @IsDefined()
    @IsNumber()
    units: number;

    // @IsDefined()
    // @IsNumber()
    // unit_price: number;

    // @IsDefined()
    // @IsString()
    // trade_date: string;
}
