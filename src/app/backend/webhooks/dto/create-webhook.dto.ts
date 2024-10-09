import { IsDefined, IsEnum } from 'class-validator';
import { WebhookEventTypes } from 'src/constants/webhook.const';

export class CreateWebhookDto {
    @IsDefined()
    url: string;

    @IsDefined()
    @IsEnum(WebhookEventTypes, { each: true })
    events: WebhookEventTypes[];
}
