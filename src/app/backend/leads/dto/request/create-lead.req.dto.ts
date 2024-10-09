import { IsDefined, IsMongoId, IsNumber, IsString } from 'class-validator';

export class CreateLeadReqDto {
    @IsDefined()
    @IsMongoId()
    customer_id: string;

    @IsDefined()
    @IsString()
    product_isin: string;

    @IsDefined()
    @IsNumber()
    product_units: number;

    @IsDefined()
    @IsNumber()
    product_xirr: number;
}
