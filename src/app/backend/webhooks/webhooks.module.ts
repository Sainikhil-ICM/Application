import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { Payment, PaymentSchema } from 'src/models/payment.model';
import { HttpModule } from '@nestjs/axios';
import { Webhook, WebhookSchema } from 'src/models/webhook.model';
import { UserCustomer, UserCustomerSchema } from 'src/models/user-customer.model';
import { User, UserSchema } from 'src/models';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: Payment.name, schema: PaymentSchema },
            { name: Webhook.name, schema: WebhookSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [WebhooksController],
    providers: [WebhooksService],
})
export class WebhooksModule {}
