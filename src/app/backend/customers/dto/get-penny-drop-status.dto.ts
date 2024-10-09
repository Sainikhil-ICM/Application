import { IsDefined, IsMongoId } from 'class-validator';

export class GetPennyDropStatusDto {
    @IsDefined()
    @IsMongoId()
    customer_id: string;

    @IsDefined()
    request_id: string;
}
