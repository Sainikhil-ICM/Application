import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/models/payment.model';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { HttpModule } from '@nestjs/axios';
import { Account, AccountSchema } from 'src/models/account.model';
import { User, UserSchema } from 'src/models/user.model';
import { UserLink, UserLinkSchema } from 'src/models/user-link.model';
import { BullModule } from '@nestjs/bull';
import { QueueName } from 'src/constants/constants';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: User.name, schema: UserSchema },
            { name: UserLink.name, schema: UserLinkSchema },
            { name: Account.name, schema: AccountSchema },
        ]),
        BullModule.registerQueue({ name: QueueName.PRODUCTS_QUEUE }),
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule {}
