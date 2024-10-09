import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { ObjectId, Types } from 'mongoose';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { ProductListingStatus } from 'src/constants/product.const';

export class GetCustomersDto {
    @IsString()
    readonly name: string;

    @IsEnum({ ...CustomerKycStatus, PENDING: 'PENDING' })
    readonly status: string;

    @Transform(({ value }) => new Types.ObjectId(value))
    readonly account_id: ObjectId;

    @IsString()
    readonly pan_number: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;

    @IsEnum(ProductListingStatus)
    readonly product_listing_status?: ProductListingStatus;
}
