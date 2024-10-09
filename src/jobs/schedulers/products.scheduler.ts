import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';
import { JobName, QueueName } from 'src/constants/constants';
import { ProductType } from 'src/constants/product.const';

@Injectable()
export class ProductsScheduler {
    constructor(
        @InjectQueue(QueueName.PRODUCTS_QUEUE)
        private productsQueue: Queue,
    ) {}

    // @Cron(CronExpression.EVERY_10_SECONDS, {
    //     name: 'EVERY_10_SECONDS',
    //     timeZone: 'Asia/Kolkata',
    // })
    // handleCron1() {
    //     console.log('🚀 ~ ProductsScheduler ~ handleCron1: EVERY_10_SECONDS');
    //     this.productsQueue.add('EVERY_10_SECONDS', {
    //         /* job data */
    //     });
    // }

    @Cron(CronExpression.EVERY_DAY_AT_9AM, {
        name: JobName.SYNC_MAX_RETURN_RATE,
        timeZone: 'Asia/Kolkata',
    })
    syncMaxReturnRate() {
        console.log('🚀 ~ ProductsScheduler ~ syncMaxReturnRate: ', JobName.SYNC_MAX_RETURN_RATE);
        this.productsQueue.add(JobName.SYNC_MAX_RETURN_RATE, {
            product_type: ProductType.LISTED_BOND,
        });

        this.productsQueue.add(JobName.SYNC_MAX_RETURN_RATE, {
            product_type: ProductType.UNLISTED_EQUITY,
        });
    }
}
