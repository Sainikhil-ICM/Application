import { IsDefined } from 'class-validator';

export class WebhookEventDto {
    @IsDefined()
    version: string;

    @IsDefined()
    timestamp: string;

    @IsDefined()
    // @IsEnum(EventTypes)
    event: string;

    @IsDefined()
    data: any;
}
