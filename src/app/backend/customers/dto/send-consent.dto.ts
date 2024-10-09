import { IsMongoId } from 'class-validator';

export class SendConsentDto {
    @IsMongoId()
    customer_id: string;
}
