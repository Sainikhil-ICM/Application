import { IsString, IsNotEmpty, IsDefined, IsMongoId } from 'class-validator';

export class SaveAccountReqDto {
    @IsMongoId()
    @IsDefined()
    customer_id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    account_number: string;

    @IsString()
    @IsNotEmpty()
    ifsc_code: string;

    @IsString()
    @IsNotEmpty()
    account_type = 'Savings';

    @IsString()
    @IsNotEmpty()
    pan_number: string;

    @IsString()
    @IsNotEmpty()
    product = 'orobonds';
}
