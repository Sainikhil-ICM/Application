import { Job } from 'bull';
import * as filter from 'lodash/filter';
import * as isEmpty from 'lodash/isEmpty';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Processor, Process } from '@nestjs/bull';

import { User, UserDocument } from 'src/models';
import { Account, AccountDocument } from 'src/models/account.model';
import { UserProduct, UserProductDocument } from 'src/models/user-product.model';
import { AccountProduct, AccountProductDocument } from 'src/models/account-product.model';

import { ProductType } from 'src/constants/product.const';
import { JobName, QueueName } from 'src/constants/constants';

import ListedBondService from 'src/services/listed-bond/listed-bond.service';
import UnlistedEquityService from 'src/services/unlisted-equity/unlisted-equity.service';

@Processor(QueueName.PRODUCTS_QUEUE)
export class ProductsConsumer {
    constructor(
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        @InjectModel(AccountProduct.name)
        private accountProductModel: Model<AccountProductDocument>,
        @InjectModel(UserProduct.name)
        private userProductModel: Model<UserProductDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        private readonly listedBondService: ListedBondService,
        private readonly unlistedEquityService: UnlistedEquityService,
    ) {}

    // @Process('EVERY_10_SECONDS')
    // async handleMyJob1(job: Job<any>) {
    //     console.log('🚀 ~ ProductsConsumer ~ handleMyJob1: EVERY_10_SECONDS');
    //     // Here you can define what happens when the job is processed
    // }

    private async _syncUserProducts(
        jobData: {
            account_id?: ObjectId;
            user_id?: ObjectId;
            product_type: ProductType;
        },
        account: AccountDocument,
        products: any[],
    ) {
        const usersQuery = {};
        usersQuery['account_id'] = account.id;

        if (jobData?.user_id) {
            // Sync products for specific user.
            usersQuery['_id'] = jobData.user_id;
        }

        const users = await this.userModel.find({ ...usersQuery }).select('_id');

        for (const user of users) {
            for (const product of products) {
                const updateQuery = {};

                if (
                    product.baseXirr &&
                    product.maxXirrDeviation &&
                    jobData.product_type === ProductType.LISTED_BOND
                ) {
                    updateQuery['max_return_rate'] =
                        Math.max(0, product.baseXirr) + //
                        Math.max(0, product.maxXirrDeviation);
                }

                if (
                    product.price &&
                    product.minPriceDeviation &&
                    jobData.product_type === ProductType.UNLISTED_EQUITY
                ) {
                    updateQuery['min_price_deviation'] = Math.max(0, product.minPriceDeviation);
                    updateQuery['max_price_deviation'] = Math.max(0, product.maxPriceDeviation);
                }

                console.log('🚀 ~ _syncUserProducts ~ updateQuery:', updateQuery);

                if (!isEmpty(updateQuery)) {
                    // Craete or update user product with max XIRR.
                    await this.userProductModel.findOneAndUpdate(
                        {
                            user_id: user._id,
                            account_id: account.id,
                            product_isin: product.ISIN,
                        },
                        { ...updateQuery },
                        { upsert: true, background: true },
                    );
                }
            }
        }
    }

    private async _syncAccountProducts(
        productType: ProductType,
        account: AccountDocument,
        products: any[],
    ) {
        // Create or update account product with max XIRR.
        for (const product of products) {
            const updateQuery = {};

            if (
                product.baseXirr &&
                product.maxXirrDeviation &&
                productType === ProductType.LISTED_BOND
            ) {
                updateQuery['max_return_rate'] =
                    Math.max(0, product.baseXirr) + //
                    Math.max(0, product.maxXirrDeviation);
            }

            if (
                product.price &&
                product.minPriceDeviation &&
                productType === ProductType.UNLISTED_EQUITY
            ) {
                updateQuery['min_price_deviation'] = Math.max(0, product.minPriceDeviation);
                updateQuery['max_price_deviation'] = Math.max(0, product.maxPriceDeviation);
            }

            console.log('🚀 ~ _syncAccountProducts ~ updateQuery:', updateQuery);

            if (!isEmpty(updateQuery)) {
                await this.accountProductModel.findOneAndUpdate(
                    {
                        account_id: account.id,
                        product_isin: product.ISIN,
                    },
                    { ...updateQuery },
                    { upsert: true, background: true },
                );
            }
        }
    }

    @Process(JobName.SYNC_MAX_RETURN_RATE)
    async syncMaxReturnRate(
        job: Job<{
            account_id?: ObjectId;
            user_id?: ObjectId;
            product_type: ProductType;
        }>,
    ) {
        console.log(
            '🚀 ~ ProductsConsumer ~ syncMaxReturnRate:',
            JobName.SYNC_MAX_RETURN_RATE,
            job,
        );

        const resGetProducts =
            job.data.product_type === ProductType.LISTED_BOND
                ? await this.listedBondService.getProducts()
                : await this.unlistedEquityService.getUnlistedEquities();

        debugger;
        if (!resGetProducts.success) {
            return {
                success: false,
                message: 'Service not available, try again later.',
            };
        }

        const products =
            job.data.product_type === ProductType.LISTED_BOND
                ? filter(resGetProducts.data, { productType: 'bonds', category: 'live' })
                : resGetProducts.data;

        const accountsQuery = {};

        if (job.data?.account_id) {
            // Sync products for specific account.
            accountsQuery['_id'] = job.data.account_id;
        }

        const accounts = await this.accountModel.find({ ...accountsQuery }).select('id');

        for (const account of accounts) {
            await this._syncUserProducts(job.data, account, products);
            await this._syncAccountProducts(job.data.product_type, account, products);
        }
    }
}
