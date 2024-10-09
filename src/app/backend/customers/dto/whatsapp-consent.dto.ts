import { IsBoolean, IsDefined } from 'class-validator';

export class WhatsappConsentDto {
    @IsDefined()
    @IsBoolean()
    is_whatsapp_consent: boolean;

    @IsDefined()
    customer_id: string;
}
