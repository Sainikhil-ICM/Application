import { IsDefined, IsMongoId, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreatePaymentDto {
    @IsDefined()
    @IsMongoId()
    user_id: ObjectId;

    @IsDefined()
    @IsString()
    isin: string;

    @IsDefined()
    @IsString()
    // TODO: Need option to pass this to B2C.
    redirect_url: string;

    @IsDefined()
    @IsNumber()
    units: number;
}
