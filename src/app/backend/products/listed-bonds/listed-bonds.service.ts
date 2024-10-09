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

import { Queue } from 'bull';
import * as filter from 'lodash/filter';
import { ResData, ResProps1 } from 'types';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SessionUser } from 'src/constants/user.const';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPriceDto } from './dto/get-price.dto';
import { JobName, QueueName, ResProps } from 'src/constants/constants';
import { ProductType } from 'src/constants/product.const';
import GetProductsDto from './dto/get-products.dto';
import { OrderStatus, SyncOrderStatusMap } from 'src/constants/payment.const';
import { CreateOrderDto } from 'src/services/listed-bond/dto/create-order.dto';
import ListedBondService from 'src/services/listed-bond/listed-bond.service';
import { ListedBondPresenter } from './presenters/listed-bond.presenter';
import { CreateProductDto } from './dto/create-product.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { ProductsRepository } from '../../products/products.repository';
import { GetPaymentLinkDto } from 'src/services/listed-bond/dto/get-payment-link.dto';
import { ListedBondsRepository } from './listed-bonds.repository';
import { OrderCreatedEventDto } from 'src/listeners/dto/order-created-event.dto';
import { GetInvestmentDto } from 'src/services/listed-bond/dto/get-investment.dto';

@Injectable()
export class ListedBondsService {
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

        private readonly listedBondService: ListedBondService,
        private readonly eventEmitter: EventEmitter2,
        private readonly productsRepository: ProductsRepository,
        private readonly listedBondsRepository: ListedBondsRepository,
    ) {}

    async getProducts(getProductsDto: GetProductsDto): Promise<ResProps> {
        const resGetProducts = await this.listedBondService.getProducts();

        if (resGetProducts.success) {
            const queryParams = { showOnBrowse: true, productType: 'bonds' };

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
                    collection: products.map((product) => {
                        return new ListedBondPresenter(product);
                    }),
                },
            };
        }

        return {
            success: false,
            message: 'Service not available, try again later.',
        };
    }

    async getPrice(isin: string, getPriceDto: GetPriceDto): Promise<ResProps> {
        const resGetProduct = await this.listedBondService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        const resGetPrice = await this.listedBondService
            // Keeping code in multiple lines.
            .getPrice({ code: resGetProduct.data.product, ...getPriceDto });

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
        const resGetProduct = await this.listedBondService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return {
            success: true,
            data: new ListedBondPresenter(resGetProduct.data),
        };
    }

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

        const resGetProduct = await this.listedBondService
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

        const resGetPrice = await this.listedBondService
            // Keeping code in multiple lines.
            .getPrice({
                code: resGetProduct.data.product,
                units: createPaymentDto.units,
                return_rate: createPaymentDto.return_rate,
            });

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message ?? 'Product price is not available, please try again.',
            };
        }

        // Syncing customer details with ICMB.
        // this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const newPayment = new this.paymentModel({});

        newPayment.set('advisor_id', session.user_id);
        newPayment.set('account_id', session.account_id);
        newPayment.set('customer_name', customer.name);
        newPayment.set('customer_email', customer.email);
        newPayment.set('customer_id', customer.id);
        newPayment.set('demat_number', customer.demat_number);
        newPayment.set('product_isin', createPaymentDto.isin);
        newPayment.set('product_name', resGetProduct.data.productName);
        newPayment.set('product_code', resGetProduct.data.product);
        newPayment.set('product_type', ProductType.LISTED_BOND);
        newPayment.set('units', createPaymentDto.units);
        newPayment.set('unit_price', resGetPrice.data.Price);
        newPayment.set('user_amount', resGetPrice.data.userAmount);
        newPayment.set('message', createPaymentDto.message);
        newPayment.set('product_issuer', resGetProduct.data.issuer);
        newPayment.set('return_rate', createPaymentDto.return_rate);

        await newPayment.save();

        // TODO: Add RM details in the user email.
        // Sending payment link to customer email.
        this.eventEmitter.emit('order.created', new OrderCreatedEventDto(newPayment.toJSON()));

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async getPayment(paymentId: ObjectId) {
        // TODO: Verify is customer is KYC verified through middleware.

        const payment = await this.listedBondsRepository
            // Keeping code in multiple lines.
            .findPayment(
                { _id: paymentId },
                'id status advisor_id customer_id unit_price product_code units return_rate',
            );

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const advisor = await this.listedBondsRepository
            // Getting advisor for this payment.
            .findUser({ _id: payment.advisor_id }, 'id name email');

        const customer = await this.listedBondsRepository
            // Keeping code in multiple lines.
            .findCustomer({ _id: payment.customer_id }, 'id name demat_number connections');

        const connection = customer.connections
            // Getting BIDD connection
            .find(({ type }) => type === ConnectionType.BIDD);

        const resGetInvestment = await this.listedBondService
            // Keeping code in multiple lines, for better readability.
            .getInvestment(
                new GetInvestmentDto({
                    unit_price: payment.unit_price,
                    product_code: payment.product_code,
                    units: payment.units,
                    return_rate: payment.return_rate,
                    access_token: connection.access_token,
                }),
            );

        if (!resGetInvestment.success) {
            return {
                success: false,
                message: resGetInvestment.message,
            };
        }

        // Updating the user amount and payment status.
        const updateQuery = {
            user_amount: resGetInvestment.data.userAmount,
        };

        if (payment.status == OrderStatus.PAYMENT_LINK_SENT) {
            updateQuery['status'] = OrderStatus.PAYMENT_LINK_OPENED;
        }

        const updatedPayment = await this.listedBondsRepository
            // Keeping code in multiple lines, for better readability.
            .updatePayment({ _id: paymentId }, { ...updateQuery }, { new: true });

        return {
            success: true,
            data: { ...updatedPayment, advisor },
        };
    }

    async getPaymentLink(paymentId: ObjectId) {
        const payment = await this.listedBondsRepository
            // Check if payment exists.
            .findPayment({ _id: paymentId });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const account = await this.listedBondsRepository
            // Gettting code from account details.
            .findAccount({ _id: payment.account_id }, 'id code');

        const customer = await this.listedBondsRepository
            // Get customer details.
            .findCustomer(
                { _id: payment.customer_id },
                'id name email demat_number pan_number connections',
            );

        const resGetProduct = await this.listedBondService
            // Checking if the product is available for purchase.
            .getProduct(payment.product_isin);

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

        const resGetPrice = await this.listedBondService
            // Get product price and availability.
            .getPrice({
                code: resGetProduct.data.product,
                units: payment.units,
                return_rate: payment.return_rate,
            });

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message,
            };
        }

        const connection = customer.connections
            // Getting BIDD connection
            .find(({ type }) => type === ConnectionType.BIDD);

        const resCreateOrder = await this.listedBondService
            // Keeping code in multiple lines.
            .createOrder(
                new CreateOrderDto({
                    demat_number: customer.demat_number,
                    units: payment.units,
                    return_rate: payment.return_rate,
                    kyc_id: connection.kyc_id,
                    pan_number: customer.pan_number,
                    product_code: payment.product_code,
                    product_isin: payment.product_isin,
                    account_code: account.code,
                    access_token: connection.access_token,
                }),
            );

        if (!resCreateOrder.success) {
            return {
                success: false,
                message: resCreateOrder.message,
            };
        }

        const updatedPayment = await this.listedBondsRepository
            // Update payment with order details.
            .updatePayment(
                { _id: payment.id },
                {
                    foreign_id: resCreateOrder.data._id,
                    order_id: resCreateOrder.data.orderId,
                    ordered_at: new Date(resCreateOrder.data.createdAt * 1000),
                    dp_name: resCreateOrder.data.dpName,
                    metadata: resCreateOrder.data,
                    status: SyncOrderStatusMap[resCreateOrder.data.status],
                },
                { new: true },
            );

        const resGetPaymentLink = await this.listedBondService
            // Getting payment link for the customer.
            .getPaymentLink(
                new GetPaymentLinkDto({
                    order_id: updatedPayment.order_id,
                    pan_number: customer.pan_number,
                    email: customer.email,
                    access_token: connection.access_token,
                }),
            );

        if (!resGetPaymentLink.success) {
            return {
                success: false,
                message: resGetPaymentLink.message,
            };
        }

        return {
            success: true,
            data: { link: resGetPaymentLink.data.eSigningUrl },
        };
    }

    async syncPayment(paymentId: ObjectId) {
        const payment = await this.listedBondsRepository
            // Keeping code in multiple lines.
            .findPayment({ _id: paymentId }, 'id customer_id product_code order_id');

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.listedBondsRepository
            // Keeping code in multiple lines.
            .findCustomer({ _id: payment.customer_id }, 'id connections');

        const connection = customer.connections
            // Getting ICM connection
            .find(({ type }) => type === ConnectionType.BIDD);

        const resGetTransactions = await this.listedBondService
            // Keeping code in multiple lines.
            .getTransactions(payment.product_code, connection.access_token);

        console.log(
            '🚀 ~ ListedBondsService ~ syncPayment ~ resGetTransactions:',
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
                await this.listedBondsRepository.updatePayment(
                    { _id: paymentId },
                    {
                        status: SyncOrderStatusMap[transaction.status],
                        transaction_id: transaction.txnId,
                    },
                );
            }
        }

        return {
            success: true,
            message: 'Payment synced successfully.',
        };
    }

    async syncUserProducts() {
        this.productsQueue.add(JobName.SYNC_MAX_RETURN_RATE, {
            product_type: ProductType.LISTED_BOND,
        });
    }

    async getUserProduct(session: SessionUser, isin: string): Promise<ResData<UserProduct>> {
        let userProduct = await this.listedBondsRepository
            // Keeping code in multiple lines.
            .findUserProduct({ user_id: session.user_id, product_isin: isin });

        if (userProduct) {
            return {
                success: true,
                data: userProduct,
            };
        }

        const resGetProduct = await this.listedBondService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: resGetProduct.message,
            };
        }

        userProduct = await this.listedBondsRepository.findOneOrInsert(
            {
                user_id: session.user_id,
                account_id: session.account_id,
                product_isin: isin,
            },
            {
                max_return_rate:
                    Math.max(0, Number(resGetProduct.data.baseXirr)) +
                    Math.max(0, Number(resGetProduct.data.maxXirrDeviation)),
            },
        );

        return {
            success: true,
            data: userProduct,
        };
    }

    async createProduct(body: CreateProductDto): Promise<ResProps> {
        const createProductRes = await this.listedBondService.createProduct(body);
        console.log('🚀 ~ ProductsService ~ createProduct ~ createProductRes:', createProductRes);

        if (!createProductRes.success) {
            return {
                success: false,
                message: createProductRes.message,
            };
        }
        return {
            success: true,
            message: 'Product Creation Successfull',
            data: createProductRes.data,
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

    async getCustomerPortfolio(customer_id: ObjectId): Promise<ResProps> {
        const customer = await this.listedBondsRepository
            // Keeping code in multiple lines.
            .findCustomer({ _id: customer_id });

        const connection = customer.connections
            // Getting ICM connection
            .find(({ type }) => type === ConnectionType.BIDD);

        const resCustomerPortfolio = await this.listedBondService
            // Keeping code in multiple lines.
            .getCustomerPortfolio(connection.access_token);

        if (!resCustomerPortfolio.success) {
            return {
                success: false,
                message: resCustomerPortfolio.message,
            };
        }

        return {
            success: true,
            data: { customer, ...resCustomerPortfolio.data },
        };
    }
}
