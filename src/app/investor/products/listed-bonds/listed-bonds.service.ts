import * as filter from 'lodash/filter';
import { Injectable } from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';

import { ResProps } from 'src/constants/constants';
import { ProductType } from 'src/constants/product.const';
import { SyncOrderStatusMap } from 'src/constants/payment.const';

import { ConnectionType } from 'src/models';

import GetProductsDto from './dto/get-products.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { ListedBondPresenter } from './presenters/listed-bond.presenter';
import { ListedBondAssetPresenter } from './presenters/listed-bond-asset.presenter';
import { ListedBondPricePresenter } from './presenters/listed-bond-price.presenter';

import ListedBondService from 'src/services/listed-bond/listed-bond.service';
import { CreateOrderDto } from 'src/services/listed-bond/dto/create-order.dto';
import { GetPaymentLinkDto } from 'src/services/listed-bond/dto/get-payment-link.dto';
import { SessionCustomer } from 'src/constants/customer.const';

import { ListedBondsRepository } from './listed-bonds.repository';

@Injectable()
export class ListedBondsService {
    constructor(
        private readonly listedBondService: ListedBondService,
        // private readonly eventEmitter: EventEmitter2,
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
            data: new ListedBondAssetPresenter(resGetProduct.data),
        };
    }

    async getPrice(isin: string, units: number): Promise<ResProps> {
        const resGetProduct = await this.listedBondService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        const resGetPrice = await this.listedBondService
            // Fetch product price from BIDD.
            .getPrice({
                code: resGetProduct.data.product,
                units,
                return_rate: parseInt(resGetProduct.data.baseXirr),
            });

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message,
            };
        }

        return {
            success: true,
            data: new ListedBondPricePresenter(resGetPrice.data),
        };
    }

    async getPaymentLink(session: SessionCustomer, createPaymentDto: CreatePaymentDto) {
        const user = await this.listedBondsRepository
            // Check if user exists.
            .findUser({ _id: createPaymentDto.user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const customer = await this.listedBondsRepository
            // Get customer details.
            .findCustomer(
                { _id: session.customer_id },
                'id name email demat_number pan_number connections',
            );

        const resGetProduct = await this.listedBondService
            // Check if this is a live product.
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

        const returnRate = parseInt(resGetProduct.data.baseXirr);

        const resGetPrice = await this.listedBondService
            // Get product price and availability.
            .getPrice({
                code: resGetProduct.data.product,
                units: createPaymentDto.units,
                return_rate: returnRate,
            });

        if (!resGetPrice.success) {
            return {
                success: false,
                message: resGetPrice.message,
            };
        }

        // Syncing customer details with ICMB.
        // this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const newPayment = await this.listedBondsRepository
            // Keeping code in multiple lines, for better readability.
            .createPayment({
                advisor_id: createPaymentDto.user_id,
                account_id: user.account_id,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_id: customer.id,
                demat_number: customer.demat_number,
                product_isin: createPaymentDto.isin,
                product_name: resGetProduct.data.productName,
                product_code: resGetProduct.data.product,
                product_type: ProductType.LISTED_BOND,
                units: createPaymentDto.units,
                unit_price: resGetPrice.data.Price,
                user_amount: resGetPrice.data.userAmount,
                product_issuer: resGetProduct.data.issuer,
                return_rate: returnRate,
            });

        if (!newPayment) {
            return {
                success: false,
                message: 'Payment could not be initiated, please try again.',
            };
        }

        const account = await this.listedBondsRepository
            // Gettting code from account details.
            .findAccount({ _id: newPayment.account_id }, 'id code');

        const connection = customer.connections
            // Getting BIDD connection
            .find(({ type }) => type === ConnectionType.BIDD);

        const resCreateOrder = await this.listedBondService
            // Using B2C service to create order.
            .createOrder(
                new CreateOrderDto({
                    demat_number: customer.demat_number,
                    units: newPayment.units,
                    return_rate: newPayment.return_rate,
                    kyc_id: connection.kyc_id,
                    pan_number: customer.pan_number,
                    product_code: newPayment.product_code,
                    product_isin: newPayment.product_isin,
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
                { _id: newPayment.id },
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
            message: 'Payment link generated successfully.',
            data: { link: resGetPaymentLink.data.eSigningUrl },
        };
    }
}
