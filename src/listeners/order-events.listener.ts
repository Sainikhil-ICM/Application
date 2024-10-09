import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import MailerService from 'src/services/mailer.service';
import { OrderCreatedEventDto } from './dto/order-created-event.dto';
import { Webhook, WebhookDocument } from 'src/models/webhook.model';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { OrderStatusEvent } from 'src/app/backend/webhooks/events/order-status.event';
import { BrandName } from 'src/constants/mailer.const';
import { PartnerNameMap } from 'src/constants/app.const';

@Injectable()
export class OrderEventsListener {
    constructor(
        @InjectModel(Webhook.name)
        private webhookModel: Model<WebhookDocument>,

        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {}

    clientUrl = this.configService.get<string>('CLIENT_URL');
    partnerName = this.configService.get<string>('PARTNER_NAME');

    private getSubject(brand_name: BrandName, subject: string): string {
        const partnerTitle =
            brand_name === BrandName.PARTNER
                ? // Keeping code in multiple lines for better readability.
                  PartnerNameMap[this.partnerName]
                : 'Bidd';
        return `${partnerTitle} | ${subject}`;
    }

    @OnEvent('order.created')
    async onOrderCreated(params: OrderCreatedEventDto) {
        // Send email with payment link.
        this.mailerService.sendTemplateEmail({
            brand_name: params.brand_name,
            template_name: 'payment-link.hbs',
            template_params: {
                action_url: `${this.clientUrl}${params.path_name}`,
            },
            subject: this.getSubject(params.brand_name, 'Transaction Initiated'),
            to_emails: [params.customer_email],
        });
    }

    @OnEvent('order.status')
    async onOrderStatusChange(params: OrderStatusEvent) {
        const webhooks = await this.webhookModel
            .find({ account_id: params.account_id })
            .select('url method events account_id');

        // TODO - log the webhook call in account.

        for (const webhook of webhooks) {
            const { method, url, events } = webhook;
            for (const event of events) {
                const data = { event, payload: {} };
                if (event === String(params.status)) {
                    try {
                        const payload = { method, url, data };
                        await this.httpService.axiosRef(payload);
                    } catch (error) {
                        console.log('🚀 ~ onOrderStatusChange ~ error:', error);
                        throw new ServiceUnavailableException(`Could not push to ${url}`);
                    }
                }
            }
        }
    }
}
