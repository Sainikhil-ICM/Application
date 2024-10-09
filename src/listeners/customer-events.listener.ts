import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from 'src/models/webhook.model';
import { CustomerSyncEvent } from 'src/app/backend/payments/events/customer-sync.event';
import { CustomerStatusEvent } from 'src/app/backend/webhooks/events/customer-status.event';
import UtilityService from 'src/services/utility.service';
import { Customer, CustomerDocument, ConnectionType } from 'src/models/customer.model';
import BondsService from 'src/services/bonds.service';
import { ConfigService } from '@nestjs/config';
import { CustomerUccCreationEvent } from 'src/app/backend/payments/events/customer-ucc.event';
import MailerService from 'src/services/mailer.service';
import { CustomerOkycSubmitEvent } from 'src/app/backend/payments/events/customer-okyc-submit.event';
import { JwtService } from '@nestjs/jwt';
import { AkycSubmitEvent } from 'src/app/backend/users/events/customer-akyc-submit.event';
import { CustomerAkycRejectEvent } from 'src/app/backend/payments/events/customer-reject-akyc.event';

@Injectable()
export class CustomerEventsListener {
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        @InjectModel(Webhook.name)
        private readonly webhookModel: Model<WebhookDocument>,
        private readonly utilityService: UtilityService,
        private readonly bondsService: BondsService,
        private readonly httpService: HttpService,
        private configService: ConfigService,
        private mailerService: MailerService,
        private jwtService: JwtService,
    ) {}

    @OnEvent('customer.sync')
    async onCustomerSync(params: CustomerSyncEvent) {
        const customer = await this.customerModel.findOne({ _id: params.id });

        if (!customer) return;

        const resGetCustomer = await this.bondsService.getCustomer(
            customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
        );

        if (!resGetCustomer.success) return;

        const customerData = resGetCustomer.data;
        const statusMap = {
            approved: 'MIN_KYC_VERIFIED',
        };
        const genderMap = {
            F: 'FEMALE',
            M: 'MALE',
            O: 'OTHER',
        };

        customer.set('name', customerData.name);
        customer.setConnectionValue(
            ConnectionType.ICM,
            'kyc_status',
            statusMap[customerData.status] ||
                customer.getConnectionValue(ConnectionType.ICM, 'kyc_status'),
        );
        // customer.set('signed_at', customerData.signedUpOn);
        const splitPhoneNumber = this.utilityService.splitPhoneNumber;
        customer.set('phone_number', splitPhoneNumber(customerData.phone).number);
        customer.set('pan_number', customerData.pan);
        customer.set('gender', genderMap[customerData.gender]);
        customer.set('birth_date', customerData.dob.dob);
        customer.set('demat_number', customerData.demat);
        customer.set('address', customerData.addressDetails?.address);
        customer.set('state', customerData.addressDetails?.state);
        customer.set('pincode', customerData.addressDetails?.pincode);
        customer.set('locality', customerData.addressDetails?.localityOrPostOffice);
        customer.set('city', customerData.addressDetails?.districtOrCity);
        customer.set('account_number', customerData.accountNumber);
        customer.set('ifsc_code', customerData.ifscCode);
        customer.set('account_type', customerData.accountType);

        await customer.save();
    }

    @OnEvent('customer.status')
    async onCustomerStatusChange(params: CustomerStatusEvent) {
        console.log('🚀 ~ CustomerEventsListener ~ onCustomerStatusChange ~ params:', params);

        const webhooks = await this.webhookModel
            .find({ account_id: { $in: params.account_ids } })
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

    @OnEvent('customer.akyc_submitted')
    async handleAkycSubmit(params: AkycSubmitEvent) {
        // TODO: Send invitation email to customer's email ID
        const inviteToken = await this.jwtService.signAsync({
            sub: 'CUSTOMER_INVITATION',
            customer_id: params.customer_id,
        });

        const clientURL = this.configService.get<string>('CLIENT_URL');
        const invitationLink = `${clientURL}/customer-invitation-assisted-kyc?token=${inviteToken}`;

        await this.mailerService.sendTemplateEmail({
            template_name: 'assisted-customer-kyc-invitation.hbs',
            template_params: {
                customer_name: params.customerName,
                rm_name: params.rmName,
                action_url: invitationLink,
            },
            subject: 'InCred Money | Finish Your E-KYC',
            to_emails: [params.email],
        });
    }

    @OnEvent('customer.ucc')
    async handleCustomerUccCreation(params: CustomerUccCreationEvent) {
        console.log('🚀 ~ CustomerEventsListener ~ handleCustomerUccCreation ~ params:', params);

        // Sending mandate request email
        const clientURL = this.configService.get<string>('CLIENT_URL');
        const invitationLink = `${clientURL}/consent/customers/${params.id}/mandate`;

        this.mailerService.sendTemplateEmail({
            template_name: 'customer-mandate.hbs',
            template_params: { action_url: invitationLink },
            subject: 'InCred Money | Mandate Request',
            to_emails: [params.email],
        });
    }

    @OnEvent('customer.okyc_submit')
    async handleCustomerOkycSubmit(params: CustomerOkycSubmitEvent) {
        // TODO: this is a temp copy-pasted email template. This is to be replaced with
        // updated correct email content

        await this.mailerService.sendTemplateEmail({
            template_name: 'customer-onboarding-invitation.hbs',
            template_params: { name: params.name },
            subject: 'ICMP KYC Form',
            to_emails: [params.email],
            attachments: params.kyc_form
                ? [
                      {
                          filename: params.attachment_name,
                          content: Buffer.from(params.kyc_form),
                          contentType: 'application/pdf',
                      },
                  ]
                : [],
        });
    }

    @OnEvent('customer.akyc_customer_reject')
    async handleCustomerAkycReject(params: CustomerAkycRejectEvent) {
        await this.mailerService.sendTemplateEmail({
            template_name: 'akyc-customer-rejection.hbs',
            template_params: {
                customer_name: params.customer_name,
                discrepency: params.discrepency,
            },
            subject: 'InCred Money | Customer Rejected KYC Form',
            to_emails: [params.rm_email],
        });
    }
}
