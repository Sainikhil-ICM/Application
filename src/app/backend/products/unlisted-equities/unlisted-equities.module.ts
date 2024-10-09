import {
    Account,
    AccountSchema,
    Customer,
    CustomerSchema,
    Payment,
    PaymentSchema,
    User,
    UserCustomer,
    UserCustomerSchema,
    UserProduct,
    UserProductSchema,
    UserSchema,
} from 'src/models';
import { Module } from '@nestjs/common';
import { UnlistedEquitiesService } from './unlisted-equities.service';
import { UnlistedEquitiesController } from './unlisted-equities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { QueueName } from 'src/constants/constants';
import { ProductsRepository } from '../products.repository';
import { UnlistedEquitiesRepository } from './unlisted-equities.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: User.name, schema: UserSchema },
            { name: Account.name, schema: AccountSchema },
            { name: UserProduct.name, schema: UserProductSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
        ]),
        BullModule.registerQueue({ name: QueueName.PRODUCTS_QUEUE }),
    ],
    controllers: [UnlistedEquitiesController],
    providers: [ProductsRepository, UnlistedEquitiesService, UnlistedEquitiesRepository],
})
export class UnlistedEquitiesModule {}
