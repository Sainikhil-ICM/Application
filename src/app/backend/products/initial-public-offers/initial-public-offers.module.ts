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
import { InitialPublicOffersService } from './initial-public-offers.service';
import { InitialPublicOffersController } from './initial-public-offers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { QueueName } from 'src/constants/constants';
import { ProductsRepository } from '../products.repository';

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
    controllers: [InitialPublicOffersController],
    providers: [ProductsRepository, InitialPublicOffersService],
})
export class InitialPublicOffersModule {}
