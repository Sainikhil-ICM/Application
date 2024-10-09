import { Module } from '@nestjs/common';
import { OrderEventsListener } from 'src/listeners/order-events.listener';
import { MongooseModule } from '@nestjs/mongoose';
import { Webhook, WebhookSchema } from 'src/models/webhook.model';
import { HttpModule } from '@nestjs/axios';
import { CustomerEventsListener } from 'src/listeners/customer-events.listener';
import { UserEventsListener } from 'src/listeners/user-events.listener';
import { LeadEventsListener } from 'src/listeners/lead-events.listener';
import { AccountEventsListener } from 'src/listeners/account-events.listener';
import { User, UserSchema } from 'src/models/user.model';
import { Lead, LeadSchema } from 'src/models/lead.model';
import { Account, AccountSchema } from 'src/models/account.model';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { Payment, PaymentSchema } from 'src/models/payment.model';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Webhook.name, schema: WebhookSchema },
            { name: Lead.name, schema: LeadSchema },
            { name: User.name, schema: UserSchema },
            { name: Account.name, schema: AccountSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: Payment.name, schema: PaymentSchema },
        ]),
    ],
    providers: [
        CustomerEventsListener,
        OrderEventsListener,
        UserEventsListener,
        LeadEventsListener,
        AccountEventsListener,
    ],
})
export class ListenerModule {}
