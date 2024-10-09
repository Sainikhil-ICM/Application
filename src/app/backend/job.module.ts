import {
    Account,
    AccountProduct,
    AccountProductSchema,
    AccountSchema,
    User,
    UserProduct,
    UserProductSchema,
    UserSchema,
} from 'src/models';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ProductsConsumer } from 'src/jobs/consumers/products.consumer';
import { ProductsScheduler } from 'src/jobs/schedulers/products.scheduler';
import { BullModule } from '@nestjs/bull';
import { QueueName } from 'src/constants/constants';

@Module({
    imports: [
        HttpModule,
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
export class JobModule {}
