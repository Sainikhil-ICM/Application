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

import * as filter from 'lodash/filter';

import { ResProps1 } from 'types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilterQuery, Model, ObjectId } from 'mongoose';

import { ResProps } from 'src/constants/constants';
import { SessionUser } from 'src/constants/user.const';
import { ProductType } from 'src/constants/product.const';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { OrderStatus, SyncOrderStatusMap } from 'src/constants/payment.const';

import { ProductsRepository } from '../products.repository';
import { MarketLinkedDebenturesRepository } from './market-linked-debentures.repository';

import { GetPriceDto } from './dto/get-price.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrderCreatedEventDto } from 'src/listeners/dto/order-created-event.dto';
import { CreateOrderDmo } from 'src/services/market-linked-debenture/dto/create-order.dmo';
import { GetPaymentLinkDmo } from 'src/services/market-linked-debenture/dto/get-payment-link.dmo';

import { LinkedDebenturePresenter } from './presenters/linked-debenture.presenter';
import MarketLinkedDebentureService from 'src/services/market-linked-debenture/market-linked-debenture.service';

@Injectable()
export class MarketLinkedDebenturesService {
    constructor(
        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
        @InjectModel(UserProduct.name)
        private readonly userProductModel: Model<UserProductDocument>,

        private readonly eventEmitter: EventEmitter2,
        private readonly marketLinkedDebentureService: MarketLinkedDebentureService,
        private readonly marketLinkedDebentureRepository: MarketLinkedDebenturesRepository,
        private readonly productsRepository: ProductsRepository,
    ) {}

    async getProducts(getProductsDto: GetProductsDto): Promise<ResProps> {
        const resGetProducts = await this.marketLinkedDebentureService.getProducts();

        if (resGetProducts.success) {
            const queryParams = { showOnBrowse: true, productType: 'mld' };

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
                        return new LinkedDebenturePresenter(product);
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
        const resGetProduct = await this.marketLinkedDebentureService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        const resGetPrice = await this.marketLinkedDebentureService
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
        const resGetProduct = await this.marketLinkedDebentureService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return {
            success: true,
            data: new LinkedDebenturePresenter(resGetProduct.data),
        };
    }

    async createPayment(session: SessionUser, createPaymentDto: CreatePaymentDto) {
        const customer = await this.marketLinkedDebentureRepository
            // Keeping code in multiple lines.
            .findCustomer({ _id: createPaymentDto.customer_id }, 'id name email demat_number');

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const resGetProduct = await this.marketLinkedDebentureService
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

        const resGetPrice = await this.marketLinkedDebentureService
            // Keeping code in multiple lines.
            .getPrice({ code: resGetProduct.data.product, units: createPaymentDto.units });

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message,
            };
        }

        // Syncing customer details with ICMB.
        // this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const payment = await this.marketLinkedDebentureRepository
            // Keeping code in multiple lines.
            .createPayment({
                advisor_id: session.user_id,
                account_id: session.account_id,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_id: customer.id,
                demat_number: customer.demat_number,
                product_isin: createPaymentDto.isin,
                product_name: resGetProduct.data.productName,
                product_code: resGetProduct.data.product,
                product_type: ProductType.MLD,
                units: createPaymentDto.units,
                unit_price: resGetPrice.data.Price,
                user_amount: resGetPrice.data.userAmount,
                message: createPaymentDto.message,
                product_issuer: resGetProduct.data.issuer,
            });

        // TODO: Add RM details in the user email.
        // Sending payment link to customer email.
        this.eventEmitter.emit('order.created', new OrderCreatedEventDto(payment));

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async getPayment(payment_id: ObjectId) {
        // TODO: Add a middleware to check customer KYC status.
        const payment = await this.paymentModel
            .findOne({ _id: payment_id })
            .populate({ path: 'advisor', select: 'name' })
            .populate<{ customer: CustomerDocument }>({
                path: 'customer',
                select: 'name demat_number',
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

    async getPaymentLink(paymentId: ObjectId) {
        const payment = await this.marketLinkedDebentureRepository
            // Check if payment exists.
            .findPayment({ _id: paymentId });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const account = await this.marketLinkedDebentureRepository
            // Gettting code from account details.
            .findAccount({ _id: payment.account_id }, 'id code status');

        const customer = await this.marketLinkedDebentureRepository
            // Get customer details.
            .findCustomer(
                { _id: payment.customer_id },
                'id name email demat_number pan_number connections',
            );

        const resGetProduct = await this.marketLinkedDebentureService
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

        const resGetPrice = await this.marketLinkedDebentureService
            // Get product price and availability.
            .getPrice({
                code: resGetProduct.data.product,
                units: payment.units,
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

        const resCreateOrder = await this.marketLinkedDebentureService
            // Keeping code in multiple lines.
            .createOrder(
                new CreateOrderDmo({
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

        const updatedPayment = await this.marketLinkedDebentureRepository
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

        const resGetPaymentLink = await this.marketLinkedDebentureService
            // Getting payment link for the customer.
            .getPaymentLink(
                new GetPaymentLinkDmo({
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
