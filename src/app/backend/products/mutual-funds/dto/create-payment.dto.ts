import { IsDefined, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ScheduleType } from 'src/constants/payment.const';
import { ProductType } from 'src/constants/product.const';

export class CreatePaymentDto {
    @IsNumber()
    amount: number;

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

    // @IsDefined()
    // @IsString()
    // product_issuer: string;

    @IsDefined()
    @IsNumber()
    units: number;

    @IsDefined()
    @IsNumber()
    return_rate: number;

    @IsString()
    @IsEnum(ScheduleType)
    payment_schedule: string;

    @IsDefined()
    @IsString()
    sip_start_date: string;

    @IsDefined()
    @IsString()
    child_order: string;

    @IsOptional()
    @IsString()
    frequency: string;

    @IsOptional()
    @IsNumber()
    installments: number;
}
