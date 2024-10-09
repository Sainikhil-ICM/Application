import {
    Account,
    AccountDocument,
    Customer,
    CustomerDocument,
    Payment,
    PaymentDocument,
    UserProduct,
    UserProductDocument,
    ConnectionType,
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
import { UnlistedEquityPresenter } from './presenters/unlisted-equity.presenter';
import { ProductType } from 'src/constants/product.const';
import GetProductsDto from './dto/get-products.dto';
import BondsService from 'src/services/bonds.service';
import { OrderStatus, SyncOrderStatusMap } from 'src/constants/payment.const';
import { CreateOrderDmo } from 'src/services/unlisted-equity/dto/create-order.dmo';
import * as filter from 'lodash/filter';
import { ResProps1 } from 'types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { ProductsRepository } from '../../products/products.repository';
import { UnlistedEquitiesRepository } from './unlisted-equities.repository';
import { OrderCreatedEventDto } from 'src/listeners/dto/order-created-event.dto';
import { GetPriceDmo } from 'src/services/unlisted-equity/dto/get-price.dmo';
import { GetTransactionsDmo } from 'src/services/unlisted-equity/dto/get-transactions.dmo';

@Injectable()
export class UnlistedEquitiesService {
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
        private readonly listedBondService: BondsService,
        private readonly eventEmitter: EventEmitter2,
        private readonly productsRepository: ProductsRepository,
        private readonly unlistedEquitiesRepository: UnlistedEquitiesRepository,
    ) {}

    async createPayment(session: SessionUser, createPaymentDto: CreatePaymentDto) {
        const customer = await this.customerModel
            .findOne({ _id: createPaymentDto.customer_id })
            .select('id name email demat_number');

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const resGetProduct = await this.unlistedEquityService
            // Keeping code in multiple lines.
            .getProduct(createPaymentDto.isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        if (resGetProduct.data.category !== 'live') {
            return {
                success: false,
                message: 'Product is not live, please contact support.',
            };
        }

        const resGetPrice = await this.unlistedEquityService
            // Getting latest price of the product.
            .getPrice(
                new GetPriceDmo({
                    isin: createPaymentDto.isin,
                    trade_date: createPaymentDto.trade_date,
                    units: createPaymentDto.units,
                }),
            );

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message,
            };
        }

        const minUnitPrice = resGetPrice.data.unitPrice - resGetPrice.data.minPriceDeviation;
        const maxUnitPrice = resGetPrice.data.unitPrice + resGetPrice.data.maxPriceDeviation;

        if (
            minUnitPrice > createPaymentDto.unit_price ||
            maxUnitPrice < createPaymentDto.unit_price
        ) {
            return {
                success: false,
                message: 'Asking price is not available, please try again.',
            };
        }

        // Syncing customer details with ICMB.
        // this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const payment = await this.unlistedEquitiesRepository
            // Keeping code in multiple lines.
            .createPayment({
                advisor_id: session.user_id,
                account_id: session.account_id,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_id: customer.id,
                demat_number: customer.demat_number,
                product_isin: createPaymentDto.isin,
                product_name: resGetProduct.data.company.displayName,
                product_code: resGetProduct.data.product,
                product_type: ProductType.UNLISTED_EQUITY,
                units: createPaymentDto.units,
                unit_price: createPaymentDto.unit_price,
                user_amount: createPaymentDto.units * createPaymentDto.unit_price,
                trade_date: createPaymentDto.trade_date,
                metadata: { price: resGetPrice.data },
            });

        // TODO: Add RM details in the user email.
        // Sending payment link to customer email.
        this.eventEmitter.emit('order.created', new OrderCreatedEventDto(payment));

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

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
                    type: ConnectionType.ICM,
                    kyc_status: CustomerKycStatus.KYC_VERIFIED,
                },
            },
        };

        if (getCustomersDto.name) {
            searchParams['name'] = { $regex: new RegExp(getCustomersDto.name, 'i') };
        }

        const [customers] = await this.productsRepository
            // Get customers able to access products
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

    async getProducts(getProductsDto: GetProductsDto): Promise<ResProps> {
        const resGetUnlistedEquities = await this.unlistedEquityService.getUnlistedEquities();

        if (resGetUnlistedEquities.success) {
            const queryParams = { showOnBrowse: true };

            if (getProductsDto.category) {
                queryParams['category'] = getProductsDto.category;
            }

            const products = filter(resGetUnlistedEquities.data, queryParams);

            return {
                success: true,
                data: {
                    total_count: products.length,
                    collection: products.map((product) => {
                        return new UnlistedEquityPresenter(product);
                    }),
                },
            };
        }

        return {
            success: false,
            message: 'Service not available, try again later.',
        };
    }

    async getPayment(payment_id: ObjectId) {
        const payment = await this.paymentModel
            .findOne({ _id: payment_id })
            .populate({ path: 'advisor', select: 'name' })
            .populate<{ customer: CustomerDocument }>({
                path: 'customer',
                select: 'name demat_number connections',
            });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        if (payment.status == OrderStatus.PAYMENT_LINK_SENT) {
            payment.status = OrderStatus.PAYMENT_LINK_OPENED;
        }

        await payment.save();

        return { success: true, data: payment };
    }

    async getPrice(isin: string, getPriceDto: GetPriceDto): Promise<ResProps> {
        const resGetPrice = await this.unlistedEquityService
            // Getting latest price of the product.
            .getPrice(
                new GetPriceDmo({
                    isin: isin,
                    trade_date: getPriceDto.trade_date,
                    units: getPriceDto.units,
                }),
            );

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message,
            };
        }

        return {
            success: true,
            data: resGetPrice.data,
        };
    }

    async getProduct(isin: string) {
        const resGetProduct = await this.unlistedEquityService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return {
            success: true,
            data: new UnlistedEquityPresenter(resGetProduct.data),
        };
    }

    async getPaymentLink(paymentId: ObjectId) {
        const payment = await this.unlistedEquitiesRepository
            // Finding payment by id.
            .findPayment(
                { _id: paymentId },
                'customer_id account_id product_isin units unit_price trade_date',
            );

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const resGetPrice = await this.unlistedEquityService
            // Getting latest price of the product.
            .getPrice(
                new GetPriceDmo({
                    isin: payment.product_isin,
                    trade_date: payment.trade_date,
                    units: payment.units,
                }),
            );

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message,
            };
        }

        const account = await this.unlistedEquitiesRepository
            // Finding account by id with code.
            .findAccount({ _id: payment.account_id }, 'id code');

        const customer = await this.unlistedEquitiesRepository
            // Finding customer by id with connections.
            .findCustomer({ _id: payment.customer_id }, 'id connections');

        const connection = customer.connections
            // Getting ICM connection
            .find(({ type }) => type === ConnectionType.ICM);

        const resCreateOrder = await this.unlistedEquityService
            // Creating unlisted equity order in ICM.
            .createOrder(
                new CreateOrderDmo({
                    product_isin: payment.product_isin,
                    units: payment.units,
                    trade_date: payment.trade_date,
                    product_code: payment.product_code,
                    access_token: connection.access_token,
                    account_code: account.code,
                    price_deviation: payment.unit_price - resGetPrice.data.unitPrice,
                }),
            );

        if (!resCreateOrder.success) {
            return {
                success: false,
                message: resCreateOrder.message,
            };
        }

        await this.unlistedEquitiesRepository.updatePayment(
            { _id: paymentId },
            {
                // foreign_id: resCreateOrder.data._id,
                order_id: resCreateOrder.data.orderId,
                ordered_at: new Date(resCreateOrder.data.updatedAt * 1000),
                // product_type: resCreateOrder.data.productType,
                // dp_name: resCreateOrder.data.dpName,
                metadata: { ...payment.metadata, order: resCreateOrder.data },
                status: SyncOrderStatusMap[resCreateOrder.data.status],
                link: resCreateOrder.data.pgDetails.redirectUrl,
            },
        );

        return {
            success: true,
            payment_link: resCreateOrder.data.pgDetails.redirectUrl,
        };
    }

    async getUserProduct(session: SessionUser, isin: string): Promise<ResProps1<UserProduct>> {
        const userProduct = await this.userProductModel
            // Keeping code in multiple lines.
            .findOne({ user_id: session.user_id, product_isin: isin });

        if (userProduct) {
            return {
                success: true,
                data: userProduct,
            };
        }

        const resGetProduct = await this.unlistedEquityService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product is not available for purchase, please contact support.',
            };
        }

        if (!resGetProduct.data.price) {
            return {
                success: false,
                message: 'Product price is not available, please contact support.',
            };
        }

        const resUserProduct = await this.userProductModel.create({
            user_id: session.user_id,
            account_id: session.account_id,
            product_isin: isin,
            min_price_deviation: resGetProduct.data.minPriceDeviation,
            max_price_deviation: resGetProduct.data.maxPriceDeviation,
        });

        return {
            success: true,
            data: resUserProduct,
        };
    }

    async syncUserProducts() {
        this.productsQueue.add(JobName.SYNC_MAX_RETURN_RATE, {
            product_type: ProductType.UNLISTED_EQUITY,
        });
    }

    async syncPayment(paymentId: ObjectId) {
        const payment = await this.unlistedEquitiesRepository
            // Keeping code in multiple lines.
            .findPayment(
                // Keeping code in multiple lines.
                { _id: paymentId },
                'id customer_id product_isin product_code order_id',
            );

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.unlistedEquitiesRepository
            // Keeping code in multiple lines.
            .findCustomer({ _id: payment.customer_id }, 'id connections');

        const connection = customer.connections
            // Getting ICM connection
            .find(({ type }) => type === ConnectionType.ICM);

        const resGetTransactions = await this.unlistedEquityService
            // Getting unlisted equity transactions by isin.
            .getTransactions(
                new GetTransactionsDmo({
                    product_isin: payment.product_isin,
                    product_code: payment.product_code,
                    order_id: payment.order_id,
                    access_token: connection.access_token,
                }),
            );

        console.log(
            '🚀 ~ UnlistedEquitiesService ~ syncPayment ~ resGetTransactions:',
            resGetTransactions,
        );

        if (!resGetTransactions.success) {
            return {
                success: false,
                message: resGetTransactions.message,
            };
        }

        // Updating the payment status.
        for (const transaction of resGetTransactions.data) {
            if (payment.order_id == transaction.orderId) {
                let status = SyncOrderStatusMap[transaction.status];

                if (transaction.status === 'success') {
                    if (transaction.adminStatus === 'accepted') {
                        status = SyncOrderStatusMap[transaction.status];
                    } else if (transaction.adminStatus === 'rejected') {
                        status = OrderStatus.ORDER_REJECTED;
                    } else {
                        status = OrderStatus.PAYMENT_SUCCESS;
                    }
                }

                await this.unlistedEquitiesRepository.updatePayment(
                    { _id: paymentId },
                    { status, transaction_id: transaction.txnId },
                );
            }
        }

        return {
            success: true,
            message: 'Payment synced successfully.',
        };
    }
}
