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
import { MarketLinkedDebenturesService } from './market-linked-debentures.service';
import { MarketLinkedDebenturesController } from './market-linked-debentures.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsRepository } from '../products.repository';
import { MarketLinkedDebenturesRepository } from './market-linked-debentures.repository';

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
    ],
    controllers: [MarketLinkedDebenturesController],
    providers: [
        ProductsRepository,
        MarketLinkedDebenturesService,
        MarketLinkedDebenturesRepository,
    ],
})
export class MarketLinkedDebenturesModule {}
