import {
    Account,
    AccountDocument,
    Customer,
    CustomerDocument,
    Payment,
    PaymentDocument,
    ConnectionType,
    UserProduct,
    UserProductDocument,
} from 'src/models';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import UnlistedEquityService from 'src/services/unlisted-equity/unlisted-equity.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SessionUser } from 'src/constants/user.const';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPriceDto } from './dto/get-price.dto';
import { JobName, QueueName, ResProps } from 'src/constants/constants';
import { ProductType } from 'src/constants/product.const';
import GetProductsDto from './dto/get-products.dto';
import { OrderStatus, SyncOrderStatusMap } from 'src/constants/payment.const';
import * as filter from 'lodash/filter';
import { ResProps1 } from 'types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import InitialPublicOfferService from 'src/services/initial-public-offer.service';
import { InitialPublicOfferPresenter } from './presenters/initial-public-offer.presenter';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { ProductsRepository } from '../../products/products.repository';

@Injectable()
export class InitialPublicOffersService {
    constructor(
        @InjectQueue(QueueName.PRODUCTS_QUEUE)
        private productsQueue: Queue,

        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
        @InjectModel(UserProduct.name)
        private readonly userProductModel: Model<UserProductDocument>,

        private readonly unlistedEquityService: UnlistedEquityService,
        private readonly initialPublicOfferService: InitialPublicOfferService,
        private readonly eventEmitter: EventEmitter2,
        private readonly productsRepository: ProductsRepository,
    ) {}

    async getProducts(getProductsDto: GetProductsDto): Promise<ResProps> {
        const resGetProducts = await this.initialPublicOfferService.getProducts();

        if (resGetProducts.success) {
            const queryParams = { showOnBrowse: true, productType: 'ipo' };

            if (getProductsDto.category) {
                queryParams['category'] = getProductsDto.category;
            }

            if (getProductsDto.listing) {
                queryParams['listingCategory'] = getProductsDto.listing;
            }

            const products = filter(resGetProducts.data, queryParams);

            return {
                success: true,
                data: {
                    total_count: products.length,
                    collection: products.map((product) => new InitialPublicOfferPresenter(product)),
                },
            };
        }

        return {
            success: false,
            message: 'Service not available, try again later.',
        };
    }

    async getProduct(isin: string) {
        const resGetProduct = await this.initialPublicOfferService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return {
            success: true,
            data: new InitialPublicOfferPresenter(resGetProduct.data),
        };
    }

    // Get customers able to access products
    async getCustomers(
        session: SessionUser,
        getCustomersDto: GetCustomersDto,
    ): Promise<ResProps1<any>> {
        const queryParams = {};

        queryParams['account_id'] = session.account_id;
        queryParams['user_id'] = session.user_id;

        const searchParams: FilterQuery<Customer> = {
            connections: {
                $elemMatch: {
                    type: ConnectionType.BIDD,
                    kyc_status: CustomerKycStatus.KYC_VERIFIED,
                },
            },
        };

        if (getCustomersDto.name) {
            searchParams['name'] = { $regex: new RegExp(getCustomersDto.name, 'i') };
        }

        const [customers] = await this.productsRepository
            // Commenting helps keep this code in multiple lines.
            .getCustomers(queryParams, searchParams, getCustomersDto);

        return {
            success: true,
            data: {
                ...customers,
                page: getCustomersDto.page,
                per_page: getCustomersDto.per_page,
            },
        };
    }
}
