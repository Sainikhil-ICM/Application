import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/models/payment.model';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { Account, AccountSchema } from 'src/models/account.model';
import BondsService from 'src/services/bonds.service';
import { HttpModule } from '@nestjs/axios';
import { IsProductLiveMiddleware } from 'src/middlewares/is-product-live.middleware';
import { IsCustomerValidMiddleware } from 'src/middlewares/is-customer-valid.middleware';
import { User, UserSchema } from 'src/models/user.model';
import IpoService from 'src/services/initial-public-offer.service';
import MailerService from 'src/services/mailer.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Account.name, schema: AccountSchema },
            { name: Payment.name, schema: PaymentSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [PaymentsController],
    // TODO - remove upload service
    providers: [PaymentsService, BondsService, IpoService, MailerService],
})
export class PaymentsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(IsProductLiveMiddleware, IsCustomerValidMiddleware)
            .forRoutes({ path: 'partner/orders', method: RequestMethod.POST });
    }
}
