import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/models/account.model';
import { AccountProduct, AccountProductSchema } from 'src/models/account-product.model';
import { UserProduct, UserProductSchema } from 'src/models/user-product.model';
import { User, UserSchema } from 'src/models/user.model';
import { ProductsScheduler } from 'src/jobs/schedulers/products.scheduler';
import { ProductsConsumer } from 'src/jobs/consumers/products.consumer';
import { ListedBondsModule } from './listed-bonds/listed-bonds.module';
import { MutualFundsModule } from './mutual-funds/mutual-funds.module';
import { UnlistedEquitiesModule } from './unlisted-equities/unlisted-equities.module';
import { QueueName } from 'src/constants/constants';
import { BullModule } from '@nestjs/bull';
import { InitialPublicOffersModule } from './initial-public-offers/initial-public-offers.module';
import { MarketLinkedDebenturesModule } from './market-linked-debentures/market-linked-debentures.module';

@Module({
    imports: [
        ListedBondsModule,
        MarketLinkedDebenturesModule,
        MutualFundsModule,
        UnlistedEquitiesModule,
        InitialPublicOffersModule,
        MongooseModule.forFeature([
            { name: Account.name, schema: AccountSchema },
            { name: AccountProduct.name, schema: AccountProductSchema },
            { name: UserProduct.name, schema: UserProductSchema },
            { name: User.name, schema: UserSchema },
        ]),
        BullModule.registerQueue({ name: QueueName.PRODUCTS_QUEUE }),
    ],
    providers: [ProductsConsumer, ProductsScheduler],
})
export class ProductsModule {}
