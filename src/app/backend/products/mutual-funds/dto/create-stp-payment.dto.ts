import { IsDefined, IsEnum, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { ScheduleType } from 'src/constants/payment.const';
import { ProductType } from 'src/constants/product.const';

export class CreateStpPaymentDto {
    @IsNumber()
    @IsDefined()
    amount: number;

    @IsDefined()
    @IsMongoId()
    customer_id: ObjectId;

    @IsDefined()
    @IsString()
    product_isin: string;

    @IsDefined()
    @IsString()
    to_product_isin: string;

    // @IsDefined()
    // @IsString()
    // product_issuer: string;

    @IsDefined()
    @IsNumber()
    units: number;

    @IsDefined()
    @IsString()
    folio_number: string;

    @IsDefined()
    @IsString()
    product_code: string;

    @IsDefined()
    @IsString()
    product_name: string;

    @IsDefined()
    @IsNumber()
    installments: number;

    @IsDefined()
    @IsEnum(ProductType)
    product_type: ProductType;

    @IsString()
    @IsEnum(ScheduleType)
    payment_schedule: string;

    @IsDefined()
    @IsString()
    frequency: string;

    @IsDefined()
    @IsString()
    stp_start_date: string;
}
