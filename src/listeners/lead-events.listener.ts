import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeadCreateEvent } from 'src/app/backend/leads/events/lead-create.event';
import { Lead, LeadDocument } from 'src/models/lead.model';
import BondsService from 'src/services/bonds.service';
import MailerService from 'src/services/mailer.service';
import Msg91Service from 'src/services/msg91.service';

@Injectable()
export class LeadEventsListener {
    constructor(
        @InjectModel(Lead.name)
        private leadModel: Model<LeadDocument>,
        private configService: ConfigService,
        private mailerService: MailerService,
        private msg91Service: Msg91Service,
        private bondsService: BondsService,
    ) {}

    clientURL = this.configService.get<string>('CLIENT_URL');

    @OnEvent('lead.create')
    async handleLeadCreate(params: LeadCreateEvent) {
        console.log('🚀 ~ LeadEventsListener ~ handleLeadCreate ~ params:', params);

        const resGetProduct = await this.bondsService.getProduct(params.product_isin);

        console.log(
            '🚀 ~ LeadEventsListener ~ handleLeadCreate ~ resGetProduct:',
            resGetProduct.data,
        );

        // Sending Lead capture email
        this.mailerService.sendTemplateEmail({
            template_name: 'product-survey.hbs',
            template_params: {
                name: params.name,
                action_url: `${this.clientURL}/leads/${params.id}`,
                prospectus_link: resGetProduct.data.prospectusLink,
                product_name: resGetProduct.data.productName,
            },
            subject: 'InCred Money | Consent Requested',
            to_emails: [params.email],
        });
    }
}
