import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
    Account,
    AccountSchema,
    Customer,
    CustomerSchema,
    Payment,
    PaymentSchema,
    User,
    UserSchema,
} from 'src/models';

import { ListedBondsService } from './listed-bonds.service';
import { ListedBondsController } from './listed-bonds.controller';
import { ListedBondsRepository } from './listed-bonds.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: User.name, schema: UserSchema },
            { name: Account.name, schema: AccountSchema },
        ]),
    ],
    controllers: [ListedBondsController],
    providers: [ListedBondsService, ListedBondsRepository],
})
export class ListedBondsModule {}
