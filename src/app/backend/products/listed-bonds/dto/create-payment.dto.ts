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
    // @IsEnum(ProductType)
    // product_type: ProductType;

    @IsDefined()
    @IsString()
    isin: string;

    // @IsDefined()
    // @IsString()
    // product_issuer: string;

    @IsDefined()
    @IsNumber()
    units: number;

    @IsDefined()
    @IsNumber()
    return_rate: number;
}
