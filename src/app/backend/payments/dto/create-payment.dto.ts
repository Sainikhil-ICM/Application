import { IsDefined, IsEnum, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ProductType } from 'src/constants/product.const';

export class CreatePaymentDto {
    @IsString()
    message: string;

    @IsDefined()
    @IsMongoId()
    customer_id: ObjectId;

    @IsDefined()
    @IsString()
    product_code: string;

    @IsDefined()
    @IsString()
    product_name: string;

    @IsDefined()
    @IsEnum(ProductType)
    product_type: ProductType;

    @IsDefined()
    @IsString()
    product_isin: string;

    @IsDefined()
    @IsString()
    product_issuer: string;

    @IsDefined()
    @IsNumber()
    units: number;

    @IsDefined()
    @IsNumber()
    return_rate: number;
}
