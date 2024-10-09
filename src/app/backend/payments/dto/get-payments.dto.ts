import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ObjectId, Types } from 'mongoose';
import { OrderStatus } from 'src/constants/payment.const';
import { ProductType } from 'src/constants/product.const';

export class GetPamentsDto {
    @IsString()
    readonly customer_name: string;

    @IsString()
    @IsEnum({ ...OrderStatus, PENDING: 'PENDING' })
    readonly status: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;

    @Transform(({ value }) => new Types.ObjectId(value))
    readonly customer_id: ObjectId;

    @IsEnum(ProductType)
    readonly product_type: ProductType;

    // @Transform(({ value }) => new Types.ObjectId(value))
    // readonly account_id: ObjectId;
}
