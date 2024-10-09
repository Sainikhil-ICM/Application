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
    UserLink,
    UserLinkSchema,
    UserProduct,
    UserProductSchema,
    UserSchema,
} from 'src/models';
import { Module } from '@nestjs/common';
import { MutualFundsService } from './mutual-funds.service';
import { MutualFundsController } from './mutual-funds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsRepository } from '../products.repository';
import { MutualFundsRepository } from './mutual-funds.repository';
import { CustomerProfile, CustomerProfileSchema } from 'src/models/customer-profile.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: CustomerProfile.name, schema: CustomerProfileSchema },
            { name: User.name, schema: UserSchema },
            { name: Account.name, schema: AccountSchema },
            { name: UserProduct.name, schema: UserProductSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: UserLink.name, schema: UserLinkSchema },
        ]),
    ],
    controllers: [MutualFundsController],
    providers: [ProductsRepository, MutualFundsService, MutualFundsRepository],
})
export class MutualFundsModule {}
