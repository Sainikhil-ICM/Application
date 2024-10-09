import * as bcrypt from 'bcrypt';
import { ResProps1 } from 'types';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';

import {
    Customer,
    CustomerDocument,
    Payment,
    PaymentDocument,
    ConnectionType,
    UserDocument,
    User,
} from 'src/models';

import {
    CartType,
    MfSubType,
    PaymentType,
    ScheduleType,
    SyncOrderStatusMap,
} from 'src/constants/payment.const';
import { SessionUser } from 'src/constants/user.const';
import { ProductType } from 'src/constants/product.const';
import { CustomerKycStatus } from 'src/constants/customer.const';

import { ResProps } from 'src/constants/constants';
import Msg91Service from 'src/services/msg91.service';
import MailerService from 'src/services/mailer.service';
import { MutualFundPresenter } from './presenters/mutual-fund.presenter';
import { CustomerSyncEvent } from '../../payments/events/customer-sync.event';
import MutualFundService from 'src/services/mutual-fund/mutual-fund.service';

import { MutualFundsRepository } from './mutual-funds.repository';
import { ProductsRepository } from '../../products/products.repository';

import GetProductsDto from './dto/get-products.dto';
import GetTaxFillingDto from './dto/get-tax-filling.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { GetCustomerTxnsDto } from './dto/get-customer-txns.dto';
import { CreateSwpPaymentDto } from './dto/create-swp-payment.dto';
import { CreateStpPaymentDto } from './dto/create-stp-payment.dto';
import { GetFolioWiseUnitsDto } from './dto/get-folio-wise-units.dto';
import { CreateSwitchPaymentDto } from './dto/create-switch-payment.dto';
import { VerifyPaymentOtpDto } from '../../payments/dto/verify-payment-otp.dto';
import { CreateRedemptionPaymentDto } from './dto/create-redemption-payment.dto';
import { OrderCreatedEventDto } from 'src/listeners/dto/order-created-event.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import GetSwitchInOutTransactionsDto from './dto/get-switch-in-out-transactions.dto';

import { UpdateCartDto } from 'src/services/mutual-fund/dmo/update-cart.dto';
import { RedeemCartDto } from 'src/services/mutual-fund/dmo/redeem-cart.dto';
import { CheckoutCartDto } from 'src/services/mutual-fund/dmo/cart-checkout.dto';
import { UpdateSwpCartDto } from 'src/services/mutual-fund/dmo/update-swp-cart.dto';
import { UpdateStpCartDto } from 'src/services/mutual-fund/dmo/update-stp-cart.dto';
import { UpdateSipCartDto } from 'src/services/mutual-fund/dmo/update-sip-cart.dto';
import { GetTransactionsDto } from 'src/services/mutual-fund/dmo/get-transactions.dto';
import { UpdateRedeemCartDto } from 'src/services/mutual-fund/dmo/update-redeem-cart.dto';
import { UpdateSwitchCartDto } from 'src/services/mutual-fund/dmo/update-switch-cart.dto';

@Injectable()
export class MutualFundsService {
    constructor(
        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,

        private readonly mutualFundService: MutualFundService,
        private readonly eventEmitter: EventEmitter2,
        private readonly productsRepository: ProductsRepository,
        private readonly mailerService: MailerService,
        private readonly msg91Service: Msg91Service,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly mutualFundsRepository: MutualFundsRepository,
    ) {}

    jwtSecret = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

    private async addToSwpCart(body: CreateSwpPaymentDto) {
        const customer = await this.customerModel.findOne({ _id: body.customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const resGetProduct = await this.mutualFundService.getProduct(body.product_isin);
        console.log('🚀 ~ MutualFundsService ~ addToSwpCart ~ resGetFromProduct:', resGetProduct);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product is not available for purchase, please contact support.',
            };
        }
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        const isCartEmpty = await this.emptyCart(jwt, CartType.STP);

        if (!isCartEmpty) {
            return {
                success: false,
                message: 'Something went wrong Cart',
            };
        }

        const dates = this.formatDates(body.swp_start_date, body.frequency, body.installments);
        const resAddToCart = await this.mutualFundService.addToSwpCart(
            new UpdateSwpCartDto(
                body.amount,
                body.folio_number,
                resGetProduct.data,
                body.frequency,
                dates.startDate,
                dates.endDate,
                new Date(body.swp_start_date).getUTCDate(),
                body.installments,
            ),
            jwt,
        );

        console.log('🚀 ~ MutualFundsService ~ resAddToCart ~ addToSwpCart:', resAddToCart);

        if (!resAddToCart.success) {
            return {
                success: false,
                message: resAddToCart.error,
            };
        }

        return {
            success: true,
            response: resAddToCart.result,
        };
    }

    private async addToStpCart(body: CreateStpPaymentDto) {
        const customer = await this.customerModel.findOne({ _id: body.customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const resGetFromProduct = await this.mutualFundService.getProduct(body.product_isin);
        console.log(
            '🚀 ~ MutualFundsService ~ addToStpCart ~ resGetFromProduct:',
            resGetFromProduct,
        );

        const resGetToProduct = await this.mutualFundService.getProduct(body.to_product_isin);
        console.log('🚀 ~ MutualFundsService ~ addToStpCart ~ resGetToProduct:', resGetToProduct);

        if (!resGetFromProduct.success || !resGetToProduct.success) {
            return {
                success: false,
                message: 'Product is not available for purchase, please contact support.',
            };
        }
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        const isCartEmpty = await this.emptyCart(jwt, CartType.STP);

        if (!isCartEmpty) {
            return {
                success: false,
                message: 'Something went wrong Cart',
            };
        }

        const dates = this.formatDates(body.stp_start_date, body.frequency, body.installments);
        const resAddToCart = await this.mutualFundService.addToStpCart(
            new UpdateStpCartDto(
                body.amount,
                body.folio_number,
                resGetFromProduct.data,
                resGetToProduct.data,
                body.frequency,
                dates.startDate,
                dates.endDate,
                new Date(body.stp_start_date).getUTCDate(),
                body.installments,
            ),
            jwt,
        );

        console.log('🚀 ~ MutualFundsService ~ resAddToCart ~ addToStpCart:', resAddToCart);

        if (!resAddToCart.success) {
            return {
                success: false,
                message: resAddToCart.error,
            };
        }

        return {
            success: true,
            fromProduct: resGetFromProduct.data,
            toProduct: resGetToProduct.data,
            response: resAddToCart.result,
        };
    }

    private async addToCart(
        cartType: CartType,
        payment: PaymentDocument,
        customer: CustomerDocument,
    ) {
        const resGetProduct = await this.mutualFundService
            // Getting product details by ISIN.
            .getProduct(payment.product_isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: resGetProduct.message,
            };
        }

        const connection = customer.connections
            // Getting ICM connection
            .find(({ type }) => type === ConnectionType.ICM);

        const jwt = this.jwtService.sign(
            {
                userId: connection.foreign_id,
                email: customer.email,
                // userId: '5e077e1440ab3954595841e6',
                // email: 'aniketpathak29@gmail.com',
            },
            { secret: this.jwtSecret },
        );

        const isCartEmpty = await this.emptyCart(jwt, cartType);

        if (!isCartEmpty) {
            return {
                success: false,
                message: 'Something went wrong Cart',
            };
        }

        let resAddToCart;

        if (payment.mutual_fund_details.sub_type === MfSubType.SIP) {
            const dates = this.formatDates(
                payment.mutual_fund_details.sip_start_date,
                payment.frequency,
                payment.mutual_fund_details.installments,
            );

            resAddToCart = await this.mutualFundService.addToSipCart(
                new UpdateSipCartDto(
                    payment.user_amount,
                    resGetProduct.data,
                    dates.startDate,
                    dates.endDate,
                    new Date(payment.mutual_fund_details.sip_start_date).getUTCDate(),
                    payment.mutual_fund_details.installments,
                    payment.frequency,
                ),
                jwt,
            );
        } else if (payment.mutual_fund_details.sub_type === MfSubType.LUMPSUM) {
            resAddToCart = await this.mutualFundService.addToCart(
                new UpdateCartDto(payment.user_amount, resGetProduct.data),
                jwt,
            );
        }

        console.log('🚀 ~ MutualFundsService ~ addToSipCart ~ resAddToCart:', resAddToCart);

        if (!resAddToCart.success) {
            return {
                success: false,
                message: resAddToCart.error,
            };
        }

        return {
            success: true,
            data: resAddToCart.result,
        };
    }

    private async addToRedemptionCart(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });

        const resGetProduct = await this.mutualFundService.getProduct(payment.product_isin);
        console.log('🚀 ~ MutualFundsService ~ checkoutRedemption ~ resGetProduct:', resGetProduct);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product is not available for purchase, please contact support.',
            };
        }
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        const isCartEmpty = await this.emptyCart(jwt, CartType.REDEMPTION);

        if (!isCartEmpty) {
            return {
                success: false,
                message: 'Something went wrong Cart',
            };
        }

        const resAddToCart = await this.mutualFundService.addToRedeemCart(
            new UpdateRedeemCartDto(payment.user_amount, payment.folio_number, resGetProduct.data),
            jwt,
        );

        console.log('🚀 ~ MutualFundsService ~ checkoutMutualFunds ~ resAddToCart:', resAddToCart);

        if (!resAddToCart.success) {
            return {
                success: false,
                message: resAddToCart.error,
            };
        }

        return {
            success: true,
            data: resAddToCart.result,
        };
    }

    private async addToSwitchCart(body: CreateSwitchPaymentDto) {
        const customer = await this.customerModel.findOne({ _id: body.customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const resGetFromProduct = await this.mutualFundService.getProduct(body.product_isin);
        console.log(
            '🚀 ~ MutualFundsService ~ addToSwitchCart ~ resGetFromProduct:',
            resGetFromProduct,
        );

        const resGetToProduct = await this.mutualFundService.getProduct(body.to_product_isin);
        console.log(
            '🚀 ~ MutualFundsService ~ addToSwitchCart ~ resGetToProduct:',
            resGetToProduct,
        );

        if (!resGetFromProduct.success || !resGetToProduct.success) {
            return {
                success: false,
                message: 'Product is not available for purchase, please contact support.',
            };
        }
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        const isCartEmpty = await this.emptyCart(jwt, CartType.SWITCH);

        if (!isCartEmpty) {
            return {
                success: false,
                message: 'Something went wrong Cart',
            };
        }

        const resAddToCart = await this.mutualFundService.addToSwitchCart(
            new UpdateSwitchCartDto(
                body.amount,
                body.folio_number,
                resGetFromProduct.data,
                resGetToProduct.data,
            ),
            jwt,
        );

        console.log('🚀 ~ MutualFundsService ~ checkoutMutualFunds ~ resAddToCart:', resAddToCart);

        if (!resAddToCart.success) {
            return {
                success: false,
                message: resAddToCart.error,
            };
        }

        return {
            success: true,
            fromProduct: resGetFromProduct.data,
            toProduct: resGetToProduct.data,
            response: resAddToCart.result,
        };
    }

    async createPayment(session: SessionUser, createPaymentDto: CreatePaymentDto) {
        // TODO: Add RM details in the user email.

        const customer = await this.mutualFundsRepository
            // Getting customer details.
            .findCustomer(
                { _id: createPaymentDto.customer_id },
                'id name email phone_code phone_number demat_number connections',
            );

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const payment = await this.mutualFundsRepository
            // Creating payment.
            .createPayment({
                advisor_id: session.user_id,
                account_id: session.account_id,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_id: customer.id,
                demat_number: customer.demat_number,
                product_isin: createPaymentDto.product_isin,
                product_name: createPaymentDto.product_name,
                product_code: createPaymentDto.product_code,
                product_type: createPaymentDto.product_type,
                units: createPaymentDto.units,
                user_amount: createPaymentDto.amount,
                return_rate: createPaymentDto.return_rate,
                payment_schedule: createPaymentDto.payment_schedule,
                frequency: createPaymentDto.frequency,
                mutual_fund_details: {
                    // TODO: child_order type should be boolean.
                    child_order: createPaymentDto.child_order,
                    sip_start_date: createPaymentDto.sip_start_date,
                    installments: createPaymentDto.installments,
                    sub_type:
                        createPaymentDto.payment_schedule === ScheduleType.RECURRING
                            ? MfSubType.SIP
                            : MfSubType.LUMPSUM,
                },
            });

        // Adding 5 seconds delay.
        // await new Promise((resolve) => setTimeout(resolve, 5000));

        const resAddToCart = await this.addToCart(
            payment.payment_schedule as unknown as CartType,
            payment,
            customer,
        );

        if (!resAddToCart.success) {
            return {
                success: false,
                message: resAddToCart.message,
            };
        }

        // Sending payment link to customer email.
        this.eventEmitter.emit('order.created', new OrderCreatedEventDto(payment));

        const phoneSecret = await this.sendPhoneCode(customer.phone_code, customer.phone_number);
        const emailSecret = await this.sendEmailCode(customer.email);

        await this.mutualFundsRepository
            // Updating customer details.
            .updatePayment(
                { _id: payment.id },
                {
                    is_consent_given: false,
                    phone_secret: phoneSecret,
                    email_secret: emailSecret,
                    'mutual_fund_details.mf_item_id': resAddToCart.data.itemId,
                },
            );

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async createSwitchPayment(session: SessionUser, body: CreateSwitchPaymentDto) {
        const customer = await this.customerModel.findOne({ _id: body.customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        //Syncing customer details with ICMB.
        this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const resSwitchCart = await this.addToSwitchCart(body);

        if (!resSwitchCart.success) {
            return {
                success: false,
                message: resSwitchCart.message,
            };
        }

        const { fromProduct, toProduct, response } = resSwitchCart;

        const newPaymentRedeem = new this.paymentModel({});

        newPaymentRedeem.set('advisor_id', session.user_id);
        newPaymentRedeem.set('account_id', session.account_id);
        newPaymentRedeem.set('customer_name', customer.name);
        newPaymentRedeem.set('customer_email', customer.email);
        newPaymentRedeem.set('customer_id', customer.id);
        newPaymentRedeem.set('demat_number', customer.demat_number);
        newPaymentRedeem.set('product_isin', fromProduct.ISIN);
        newPaymentRedeem.set('product_name', fromProduct.schemeName);
        newPaymentRedeem.set('product_code', fromProduct.amfiCode);
        newPaymentRedeem.set('type', 'redeem');
        newPaymentRedeem.set('units', body.units);
        newPaymentRedeem.set('folio_number', body.folio_number);
        newPaymentRedeem.set('product_type', body.product_type);
        //newPaymentRedeem.set('unit_price', productPrice?.Price);
        newPaymentRedeem.set('user_amount', body.amount);
        newPaymentRedeem.set('switch_to', toProduct.schemeName);

        newPaymentRedeem.set('mutual_fund_details', {
            mf_item_id: response.itemId,
            sub_type: MfSubType.SWITCH_IN,
        });
        // newPayment.set('product_issuer', body.product_issuer);
        // newPayment.set('return_rate', body.return_rate);

        await newPaymentRedeem.save();

        const newPaymentPurchase = new this.paymentModel({});

        newPaymentPurchase.set('advisor_id', session.user_id);
        newPaymentPurchase.set('account_id', session.account_id);
        newPaymentPurchase.set('customer_name', customer.name);
        newPaymentPurchase.set('customer_email', customer.email);
        newPaymentPurchase.set('customer_id', customer.id);
        newPaymentPurchase.set('demat_number', customer.demat_number);
        newPaymentPurchase.set('product_isin', toProduct.ISIN);
        newPaymentPurchase.set('product_name', toProduct.schemeName);
        newPaymentPurchase.set('product_code', toProduct.amfiCode);
        newPaymentPurchase.set('type', 'purchase');
        newPaymentPurchase.set('units', body.units);
        newPaymentPurchase.set('folio_number', body.folio_number);
        newPaymentPurchase.set('product_type', body.product_type);
        //newPaymentPurchase.set('unit_price', productPrice?.Price);
        newPaymentPurchase.set('user_amount', body.amount);
        newPaymentPurchase.set('switch_from', fromProduct.schemeName);
        newPaymentPurchase.set('mutual_fund_details', {
            mf_item_id: response.itemId,
            sub_type: MfSubType.SWITCH_OUT,
        });
        // newPayment.set('product_issuer', body.product_issuer);
        // newPayment.set('return_rate', body.return_rate);

        await newPaymentPurchase.save();

        this.eventEmitter.emit(
            'order.created',
            new OrderCreatedEventDto(newPaymentRedeem.toJSON()),
        );

        const phoneSecret = await this.sendPhoneCode(customer.phone_code, customer.phone_number);

        const emailSecret = await this.sendEmailCode(customer.email);

        newPaymentRedeem.email_secret = emailSecret;

        newPaymentRedeem.phone_secret = phoneSecret;

        await newPaymentRedeem.save();

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async createSwpPayment(session: SessionUser, createSwpPaymentDto: CreateSwpPaymentDto) {
        // TODO: Add RM details in the user email.

        const customer = await this.customerModel.findOne({
            _id: createSwpPaymentDto.customer_id,
        });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        // const productPrice = resGetProductPrice.data;
        const resSwpCart = await this.addToSwpCart(createSwpPaymentDto);

        if (!resSwpCart.success) {
            return {
                success: false,
                message: resSwpCart.message,
            };
        }

        const { response } = resSwpCart;
        const mf_item_id = response.itemId;
        // Syncing customer details with ICMB.
        this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const newPayment = new this.paymentModel({});

        newPayment.set('advisor_id', session.user_id);
        newPayment.set('account_id', session.account_id);
        newPayment.set('customer_name', customer.name);
        newPayment.set('customer_email', customer.email);
        newPayment.set('customer_id', customer.id);
        newPayment.set('demat_number', customer.demat_number);
        newPayment.set('product_isin', createSwpPaymentDto.product_isin);
        newPayment.set('product_name', createSwpPaymentDto.product_name);
        newPayment.set('product_code', createSwpPaymentDto.product_code);
        newPayment.set('type', 'redeem');
        newPayment.set('units', createSwpPaymentDto.units);
        newPayment.set('folio_number', createSwpPaymentDto.folio_number);
        newPayment.set('product_type', createSwpPaymentDto.product_type);
        //newPayment.set('unit_price', productPrice?.Price);
        newPayment.set('user_amount', createSwpPaymentDto.amount);
        //newPayment.set('product_issuer', body.product_issuer);
        //newPayment.set('return_rate', body.return_rate);
        newPayment.set('payment_schedule', createSwpPaymentDto.payment_schedule);
        newPayment.set('frequency', createSwpPaymentDto.frequency);

        newPayment.set('mutual_fund_details', {
            mf_item_id: mf_item_id,
            installments: createSwpPaymentDto.installments,
            swp_start_date: createSwpPaymentDto.swp_start_date,
        });

        await newPayment.save();

        // Sending payment link to customer email.
        this.eventEmitter.emit('order.created', new OrderCreatedEventDto(newPayment.toJSON()));

        const phoneSecret = await this.sendPhoneCode(customer.phone_code, customer.phone_number);

        const emailSecret = await this.sendEmailCode(customer.email);

        newPayment.email_secret = emailSecret;

        newPayment.phone_secret = phoneSecret;

        await newPayment.save();

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async createRedemptionPayment(
        session: SessionUser,
        createRedemptionPaymentDto: CreateRedemptionPaymentDto,
    ) {
        // TODO: Add RM details in the user email.

        const customer = await this.customerModel.findOne({
            _id: createRedemptionPaymentDto.customer_id,
        });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        // const productPrice = resGetProductPrice.data;

        // Syncing customer details with ICMB.
        //this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const newPayment = new this.paymentModel({});

        newPayment.set('advisor_id', session.user_id);
        newPayment.set('account_id', session.account_id);
        newPayment.set('customer_name', customer.name);
        newPayment.set('customer_email', customer.email);
        newPayment.set('customer_id', customer.id);
        newPayment.set('demat_number', customer.demat_number);
        newPayment.set('product_isin', createRedemptionPaymentDto.product_isin);
        newPayment.set('product_name', createRedemptionPaymentDto.product_name);
        newPayment.set('product_code', createRedemptionPaymentDto.product_code);
        newPayment.set('type', 'redeem');
        newPayment.set('units', createRedemptionPaymentDto.units);
        newPayment.set('folio_number', createRedemptionPaymentDto.folio_number);
        newPayment.set('product_type', createRedemptionPaymentDto.product_type);
        //newPayment.set('unit_price', productPrice?.Price);
        newPayment.set('user_amount', createRedemptionPaymentDto.amount);
        //newPayment.set('product_issuer', body.product_issuer);
        //newPayment.set('return_rate', body.return_rate);
        const mutualFundDetails: { [key: string]: any } = {
            sub_type: MfSubType.REDEMPTION,
        };

        newPayment.set('mutual_fund_details', mutualFundDetails);

        await newPayment.save();

        // await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay

        const resCheckoutRedeem = await this.addToRedemptionCart(newPayment.id);

        if (!resCheckoutRedeem.success) {
            return {
                success: false,
                message: resCheckoutRedeem.message,
            };
        }

        // Sending payment link to customer email.
        this.eventEmitter.emit('order.created', new OrderCreatedEventDto(newPayment.toJSON()));

        const phoneSecret = await this.sendPhoneCode(customer.phone_code, customer.phone_number);

        const emailSecret = await this.sendEmailCode(customer.email);

        newPayment.email_secret = emailSecret;

        newPayment.phone_secret = phoneSecret;

        newPayment.mutual_fund_details.mf_item_id = resCheckoutRedeem.data.itemId;

        await newPayment.save();

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async checkoutMutualFunds(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });
        const user = await this.userModel.findOne({ _id: payment.advisor_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const bankData = await this.mutualFundService.fetchBanks(payload);

        const primaryBankId = bankData.result.filter((item) => item.isPrimary)[0]?.bankId || null;

        console.log('🚀 ~ MutualFundsService ~ fetchBanks ~ bankData:', bankData);

        const resCheckoutCart = await this.mutualFundService.checkoutCart(
            new CheckoutCartDto({
                pan_number: customer.pan_number, //
                bank_id: primaryBankId,
                payment_mode: payment?.payment_mode || 'netbanking',
                ifa_code: user?.code,
            }),
            payload,
        );
        console.log(
            '🚀 ~ MutualFundsService ~ checkoutMutualFunds ~ resCheckoutCart:',
            resCheckoutCart,
        );

        if (!resCheckoutCart.success) {
            return {
                success: false,
                message: resCheckoutCart.error,
            };
        }

        // Saving BSE order ids in payment
        const mutualFundDetails = payment.get('mutual_fund_details');

        mutualFundDetails.order_ids = resCheckoutCart.result.filter(Boolean);

        await payment.save();

        return {
            success: true,
        };
    }

    async checkoutSipMutualFunds(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });
        const user = await this.userModel.findOne({ _id: payment.advisor_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const bankData = await this.mutualFundService.fetchBanks(payload);

        const primaryBankId = bankData.result.filter((item) => item.isPrimary)[0]?.bankId || null;

        console.log('🚀 ~ MutualFundsService ~ fetchBanks ~ bankData:', bankData);

        const resCheckoutCart = await this.mutualFundService.checkoutSipCart(
            new CheckoutCartDto({
                pan_number: customer.pan_number, // 'AQZPP7955Q'; // 'BMKPG9278B';
                bank_id: primaryBankId,
                payment_mode: payment?.payment_mode || 'netbanking',
                ifa_code: user?.code,
            }),
            payload,
        );
        console.log(
            '🚀 ~ MutualFundsService ~ checkoutSipMutualFunds ~ resCheckoutCart:',
            resCheckoutCart,
        );

        if (!resCheckoutCart.success) {
            return {
                success: false,
                message: resCheckoutCart.error,
            };
        }

        // Saving sip registraion ids in payment.

        const mutualFundDetails = payment.get('mutual_fund_details');

        mutualFundDetails.sip_registraion_id = resCheckoutCart.result.filter(Boolean);

        await payment.save();

        return {
            success: true,
        };
    }

    async checkoutSwp(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });
        const user = await this.userModel.findOne({ _id: payment.advisor_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const bankData = await this.mutualFundService.fetchBanks(payload);

        const primaryBankAccountNumber =
            bankData.result.filter((item) => item.isPrimary)[0]?.accountNumber || null;

        console.log('🚀 ~ MutualFundsService ~ fetchBanks ~ bankData:', bankData);

        const resCheckoutCart = await this.mutualFundService.checkoutSwpCart(
            new RedeemCartDto({
                pan_number: 'KUCPS6962M',
                account_number: '60140169414',
                bank_id: '669f4a3add75b17251abdf73',
                ifa_code: user?.code,
            }),
            payload,
        );

        console.log(
            '🚀 ~ MutualFundsService ~ checkoutMutualFunds ~ resCheckoutCart:',
            resCheckoutCart,
        );

        if (!resCheckoutCart.success) {
            return {
                success: false,
                message: resCheckoutCart.error,
            };
        }

        const mutualFundDetails = payment.get('mutual_fund_details');

        mutualFundDetails.order_ids = resCheckoutCart.result.filter(Boolean);

        await payment.save();

        return {
            success: true,
        };
    }

    async checkoutRedemption(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });
        const user = await this.userModel.findOne({ _id: payment.advisor_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const bankData = await this.mutualFundService.fetchBanks(payload);

        const primaryBankAccountNumber =
            bankData.result.filter((item) => item.isPrimary)[0]?.accountNumber || null;

        console.log('🚀 ~ MutualFundsService ~ fetchBanks ~ bankData:', bankData);

        const resCheckoutCart = await this.mutualFundService.checkoutRedeemCart(
            new RedeemCartDto({
                pan_number: customer.pan_number,
                account_number: primaryBankAccountNumber,
                ifa_code: user?.code,
            }),
            payload,
        );
        console.log(
            '🚀 ~ MutualFundsService ~ checkoutMutualFunds ~ resCheckoutCart:',
            resCheckoutCart,
        );

        if (!resCheckoutCart.success) {
            return {
                success: false,
                message: resCheckoutCart.error,
            };
        }

        const mutualFundDetails = payment.get('mutual_fund_details');

        mutualFundDetails.order_ids = resCheckoutCart.result.filter(Boolean);

        await payment.save();

        return {
            success: true,
        };
    }

    private async checkoutSwitch(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });
        const user = await this.userModel.findOne({ _id: payment.advisor_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const bankData = await this.mutualFundService.fetchBanks(payload);

        const primaryBankId = bankData.result.filter((item) => item.isPrimary)[0]?.bankId || null;

        console.log('🚀 ~ MutualFundsService ~ fetchBanks ~ bankData:', bankData);

        const resCheckoutCart = await this.mutualFundService.checkoutSwitchCart(
            new CheckoutCartDto({
                pan_number: customer.pan_number, //
                bank_id: String(primaryBankId),
                payment_mode: payment?.payment_mode || 'netbanking',
                ifa_code: user?.code,
            }),
            payload,
        );
        console.log(
            '🚀 ~ MutualFundsService ~ checkoutMutualFunds ~ resCheckoutCart:',
            resCheckoutCart,
        );

        if (!resCheckoutCart.success) {
            return {
                success: false,
                message: resCheckoutCart.error,
            };
        }

        const mutualFundDetails = payment.get('mutual_fund_details');

        mutualFundDetails.order_ids = resCheckoutCart.result.filter(Boolean);

        await payment.save();

        return {
            success: true,
        };
    }

    private async checkoutStp(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });
        const user = await this.userModel.findOne({ _id: payment.advisor_id });
        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const bankData = await this.mutualFundService.fetchBanks(payload);

        const primaryBankId = bankData.result.filter((item) => item.isPrimary)[0]?.bankId || null;

        console.log('🚀 ~ MutualFundsService ~ fetchBanks ~ bankData:', bankData);

        const resCheckoutCart = await this.mutualFundService.checkoutStpCart(
            new CheckoutCartDto({
                pan_number: customer.pan_number, //
                bank_id: String(primaryBankId),
                payment_mode: payment?.payment_mode || 'netbanking',
                ifa_code: user?.code,
            }),
            payload,
        );
        console.log('🚀 ~ MutualFundsService ~ checkoutStp ~ resCheckoutCart:', resCheckoutCart);

        if (!resCheckoutCart.success) {
            return {
                success: false,
                message: resCheckoutCart.error,
            };
        }

        const mutualFundDetails = payment.get('mutual_fund_details');

        mutualFundDetails.order_ids = resCheckoutCart.result.map((item) => item.stpRegNo);

        await payment.save();

        return {
            success: true,
        };
    }

    async createStpPayment(session: SessionUser, body: CreateStpPaymentDto) {
        const customer = await this.customerModel.findOne({ _id: body.customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        //Syncing customer details with ICMB.
        this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const resStpCart = await this.addToStpCart(body);

        if (!resStpCart.success) {
            return {
                success: false,
                message: resStpCart.message,
            };
        }

        const { fromProduct, toProduct, response } = resStpCart;
        const mf_item_id = response.itemId;
        const newPaymentRedeem = new this.paymentModel({});

        newPaymentRedeem.set('advisor_id', session.user_id);
        newPaymentRedeem.set('account_id', session.account_id);
        newPaymentRedeem.set('customer_name', customer.name);
        newPaymentRedeem.set('customer_email', customer.email);
        newPaymentRedeem.set('customer_id', customer.id);
        newPaymentRedeem.set('demat_number', customer.demat_number);
        newPaymentRedeem.set('product_isin', fromProduct.ISIN);
        newPaymentRedeem.set('product_name', fromProduct.schemeName);
        newPaymentRedeem.set('product_code', fromProduct.amfiCode);
        newPaymentRedeem.set('type', 'redeem');
        newPaymentRedeem.set('units', body.units);
        newPaymentRedeem.set('folio_number', body.folio_number);
        newPaymentRedeem.set('product_type', body.product_type);
        //newPaymentRedeem.set('unit_price', productPrice?.Price);
        newPaymentRedeem.set('user_amount', body.amount);
        newPaymentRedeem.set('switch_to', toProduct.schemeName);
        newPaymentRedeem.set('payment_schedule', body.payment_schedule);
        newPaymentRedeem.set('frequency', body.frequency);
        // newPayment.set('product_issuer', body.product_issuer);
        // newPayment.set('return_rate', body.return_rate);
        newPaymentRedeem.set('mutual_fund_details', {
            mf_item_id: mf_item_id,
            installments: body.installments,
            stp_start_date: body.stp_start_date,
        });
        await newPaymentRedeem.save();

        const newPaymentPurchase = new this.paymentModel({});

        newPaymentPurchase.set('advisor_id', session.user_id);
        newPaymentPurchase.set('account_id', session.account_id);

        newPaymentPurchase.set('customer_name', customer.name);
        newPaymentPurchase.set('customer_email', customer.email);
        newPaymentPurchase.set('customer_id', customer.id);
        newPaymentPurchase.set('demat_number', customer.demat_number);
        newPaymentPurchase.set('product_isin', toProduct.ISIN);
        newPaymentPurchase.set('product_name', toProduct.schemeName);
        newPaymentPurchase.set('product_code', toProduct.amfiCode);
        newPaymentPurchase.set('type', 'purchase');
        newPaymentPurchase.set('units', body.units);
        newPaymentPurchase.set('folio_number', body.folio_number);
        newPaymentPurchase.set('product_type', body.product_type);
        //newPaymentPurchase.set('unit_price', productPrice?.Price);
        newPaymentPurchase.set('user_amount', body.amount);
        newPaymentPurchase.set('switch_from', fromProduct.schemeName);
        newPaymentPurchase.set('payment_schedule', body.payment_schedule);

        newPaymentPurchase.set('frequency', body.frequency);
        newPaymentPurchase.set('mutual_fund_details', {
            mf_item_id: mf_item_id,
            installments: body.installments,
            stp_start_date: body.stp_start_date,
            sub_type: MfSubType.STP_IN,
        });
        // newPayment.set('product_issuer', body.product_issuer);
        // newPayment.set('return_rate', body.return_rate);

        await newPaymentPurchase.save();

        this.eventEmitter.emit(
            'order.created',
            new OrderCreatedEventDto(newPaymentRedeem.toJSON()),
        );

        const phoneSecret = await this.sendPhoneCode(customer.phone_code, customer.phone_number);

        const emailSecret = await this.sendEmailCode(customer.email);

        newPaymentRedeem.email_secret = emailSecret;

        newPaymentRedeem.phone_secret = phoneSecret;

        await newPaymentRedeem.save();

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async emptyCart(token: string, cart_type: CartType): Promise<boolean> {
        try {
            const getCartItemsMap = {
                [CartType.ONE_TIME]: () => this.mutualFundService.getAllCartItems(token),
                [CartType.RECURRING]: () => this.mutualFundService.getAllSipCartItems(token),
                [CartType.REDEMPTION]: () =>
                    this.mutualFundService.getAllRedemptionCartItems(token),

                [CartType.SWITCH]: () => this.mutualFundService.getAllSwitchCartItems(token),
                [CartType.STP]: () => this.mutualFundService.getAllStpCartItems(token),
                [CartType.SWP]: () => this.mutualFundService.getAllSwpCartItems(token),
                // Add other schedule types here
            };

            const deleteCartItemMap = {
                [CartType.ONE_TIME]: (itemId: string) =>
                    this.mutualFundService.deleteCartItem(token, itemId),
                [CartType.RECURRING]: (itemId: string) =>
                    this.mutualFundService.deleteSipCartItem(token, itemId),
                [CartType.REDEMPTION]: (itemId: string) =>
                    this.mutualFundService.deleteRedemptionCartItem(token, itemId),
                [CartType.SWITCH]: (itemId: string) =>
                    this.mutualFundService.deleteSwitchCartItem(token, itemId),
                [CartType.STP]: (itemId: string) =>
                    this.mutualFundService.deleteStpCartItem(token, itemId),
                [CartType.SWP]: (itemId: string) =>
                    this.mutualFundService.deleteSwpCartItem(token, itemId),
                // Add other schedule types here
            };

            const getCartItems = getCartItemsMap[cart_type];
            const deleteCartItem = deleteCartItemMap[cart_type];

            if (!getCartItems || !deleteCartItem) {
                throw new Error(`Unsupported schedule type: ${cart_type}`);
            }

            const customerCart = await getCartItems();
            console.log('🚀 ~ MutualFundsService ~ emptyCart ~ customerCart:', customerCart);

            if (!customerCart.length) {
                // The cart is already empty
                return true;
            }

            const deleteResults = await Promise.all(
                customerCart.map(async (cartItem) => {
                    const response = await deleteCartItem(cartItem.itemId);
                    return response.success === true;
                }),
            );

            return deleteResults.every((result) => result === true);
        } catch (error) {
            console.error('Error emptying cart:', error);
            return false;
        }
    }

    private formatDates(timestamp, frequency = 'monthly', installments = 12) {
        // Parse the timestamp
        const date = new Date(timestamp);

        // Extract the month, day, and year
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-based, so we add 1
        const year = date.getUTCFullYear();

        // Format the start date as MMYYYY
        const startDate = `${month}${year}`;

        // Calculate the end date based on the frequency and number of installments
        let endDate;

        if (frequency === 'monthly') {
            const endDateMonth = String(
                (date.getUTCMonth() + 1 + installments) % 12 || 12,
            ).padStart(2, '0'); // Add the installments to the month and handle rollover
            const endDateYear =
                date.getUTCFullYear() +
                Math.floor((date.getUTCMonth() + 1 + installments - 1) / 12); // Add remaining years
            endDate = `${endDateMonth}${endDateYear}`;
        } else if (frequency === 'weekly') {
            const totalDays = installments * 7;
            const endDateDate = new Date(date.getTime() + totalDays * 24 * 60 * 60 * 1000);
            const endDateMonth = String(endDateDate.getUTCMonth() + 1).padStart(2, '0');
            const endDateYear = endDateDate.getUTCFullYear();
            endDate = `${endDateMonth}${endDateYear}`;
        } else if (frequency === 'quarterly') {
            const quartersToAdd = installments * 3;
            const endDateMonth = String(
                (date.getUTCMonth() + 1 + quartersToAdd) % 12 || 12,
            ).padStart(2, '0');
            const endDateYear =
                date.getUTCFullYear() +
                Math.floor((date.getUTCMonth() + 1 + quartersToAdd - 1) / 12);
            endDate = `${endDateMonth}${endDateYear}`;
        } else {
            throw new Error('Unsupported frequency. Use "weekly", "monthly", or "quarterly".');
        }

        return { startDate, endDate };
    }

    async fetchBanks(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const bankData = await this.mutualFundService.fetchBanks(payload);

        console.log('🚀 ~ PaymentsService ~ fetchBanks ~ bankData:', bankData);

        if (!bankData.success) {
            return {
                success: false,
                message: 'Bank information not found.',
            };
        }

        return {
            success: true,
            data: bankData.result,
            message: 'Bank information found.',
        };
    }

    async fetchMutualFundsPaymentStatus(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');
        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        const paymentStatusPoll = await this.mutualFundService.fetchMutualFundsPaymentStatus(
            jwt,
            customer.pan_number,
            payment.mutual_fund_details.order_ids,
        );

        console.log(
            '🚀 ~ MutualFundService ~ pollMutualFundsPayment ~ resGetPaymentLink:',
            paymentStatusPoll,
        );

        if (paymentStatusPoll.success) {
            payment['status'] = SyncOrderStatusMap[paymentStatusPoll.result];
            await payment.save();
        }

        if (!paymentStatusPoll.success) {
            return {
                success: false,
                message: paymentStatusPoll.error,
            };
        }

        return {
            success: true,
            data: { status: paymentStatusPoll.result },
        };
    }

    async getMutualFundsPaymentUrl(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });

        // const payload = {
        //     userId: '5e077e1440ab3954595841e6',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');
        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        if (
            payment.mutual_fund_details.child_order === 'true' &&
            payment.payment_schedule === ScheduleType.RECURRING
        ) {
            const createChildOrder = await this.mutualFundService.createChildOrder(
                payment.mutual_fund_details.sip_registraion_id[0],
                jwt,
            );

            const mutualFundDetails = payment.get('mutual_fund_details');

            (mutualFundDetails.sip_registraion_id = createChildOrder.result.bseOrderId),
                await payment.save();

            console.log(
                '🚀 ~ MutualFundService ~ createChildOrder ~ createChildOrder:',
                createChildOrder,
            );
        }

        const clientUrl = this.configService.get<string>('CLIENT_URL');

        const paymentLinkPayload = {
            redirection_url: `${clientUrl}/orders/${payment.id}/payments/status?status=success`,
            order_ids: payment.mutual_fund_details.order_ids,
            jwt: jwt,
            paymentType: payment.payment_mode,
            bankId: payment.bank_id,
            vpaId: payment?.upi_id || '',
            utr_number: payment.utr_number || '',
        };

        let resGetPaymentLink;

        if (payment.payment_schedule === ScheduleType.RECURRING) {
            resGetPaymentLink = await this.mutualFundService.getSipPaymentLink({
                ...paymentLinkPayload,
            });
        } else {
            resGetPaymentLink = await this.mutualFundService.getPaymentLink({
                ...paymentLinkPayload,
            });
        }

        console.log(
            '🚀 ~ MutualFundService ~ pollMutualFundsPayment ~ resGetPaymentLink:',
            resGetPaymentLink,
            `${clientUrl}/orders/${payment.id}/payments/status?status=success`,
        );

        if (!resGetPaymentLink.success) {
            return {
                success: false,
                message: resGetPaymentLink.error,
            };
        }

        return {
            success: true,
            data: { payment_link: resGetPaymentLink.data.responsestring },
        };
    }

    async getProducts(getProductsDto: GetProductsDto): Promise<ResProps> {
        const resGetProducts = await this.mutualFundService.getProducts(getProductsDto);

        if (resGetProducts.success) {
            const filteredData = resGetProducts.data.filter((item: any) => item !== null);
            return { success: true, data: filteredData };
        }

        return {
            success: false,
            message: 'Service not available, try again later.',
        };
    }

    async getProduct(isin: string) {
        const resGetProduct = await this.mutualFundService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return { success: true, data: resGetProduct.data };
        return {
            success: true,
            data: new MutualFundPresenter(resGetProduct.data),
        };
    }

    async getSwitchToFunds(isin: string, is_stp = false): Promise<ResProps> {
        const resGetSwitchToFunds = await this.mutualFundService.getSwitchToFunds(isin, is_stp);

        if (resGetSwitchToFunds.success) {
            return { success: true, data: resGetSwitchToFunds.data };
        }

        return {
            success: false,
            message: resGetSwitchToFunds.message ?? 'Service not available, try again later.',
        };
    }

    async getSipDates(isin: string): Promise<ResProps> {
        const resSipDates = await this.mutualFundService.getMutualFundSipDates(isin);

        if (!resSipDates.success) {
            return {
                success: false,
                message: 'Service not available, try again later.',
            };
        }

        return {
            success: true,
            data: resSipDates.data,
        };
    }

    async getMutualFundStpDates(isin: string): Promise<ResProps> {
        const resSipDates = await this.mutualFundService.getMutualFundStpDates(isin);

        if (!resSipDates.success) {
            return {
                success: false,
                message: 'Service not available, try again later.',
            };
        }

        return {
            success: true,
            data: resSipDates.data,
        };
    }

    async getMutualFundSwpInfo(isin: string): Promise<ResProps> {
        const resSipDates = await this.mutualFundService.getMutualFundSwpInfo(isin);

        if (!resSipDates.success) {
            return {
                success: false,
                message: 'Service not available, try again later.',
            };
        }

        return {
            success: true,
            data: resSipDates.data,
        };
    }

    async getNavData(amfi_code: string, previous: number): Promise<ResProps> {
        const chartAllNav = await this.mutualFundService.getMutualFundNav(amfi_code, previous);

        if (!chartAllNav.success) {
            return {
                success: false,
                message: chartAllNav.message || 'Navs chart fetching failed.',
            };
        }

        return {
            success: true,
            data: chartAllNav.data,
            message: 'Navs chart fetched successfully.',
        };
    }

    async getOneTimePassword(): Promise<any> {
        const token = Math.random().toString().substring(4, 8);
        const secret = await bcrypt.hash(token, 10);

        console.log('🚀 ~ Login Token', token, secret);
        return { token, secret };
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

    async getCustomerFolioWiseUnits(customer_id: string, query: GetFolioWiseUnitsDto) {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const response = await this.mutualFundService.getCustomerFolioWiseUnits(payload, {
            codeAMFI: query.amfi_code,
            pan: customer.pan_number,
        });

        console.log('🚀 ~ MutualFundsService ~ getCustomerFolioWiseUnits ~ response:', response);

        if (response.success) {
            return {
                success: true,
                data: response.data.folioWiseUnits,
            };
        } else {
            return {
                success: false,
                message: response.err,
            };
        }
    }

    async getCustomerTxns(
        customer_id: ObjectId,
        getCustomerTxnsDto: GetCustomerTxnsDto,
    ): Promise<ResProps> {
        const customer = await this.mutualFundsRepository
            // Keeping code in multiple lines.
            .findCustomer({ _id: customer_id }, 'email connections');

        const connection = customer.connections
            // Getting ICM connection
            .find(({ type }) => type === ConnectionType.ICM);

        const resGetCustomerTxns = await this.mutualFundService
            // Getting customer transactions
            .getCustomerTxns(
                new GetTransactionsDto({
                    ...getCustomerTxnsDto,
                    foreign_id: connection.foreign_id,
                    email: customer.email,
                }),
            );

        if (!resGetCustomerTxns.success) {
            return {
                success: false,
                message: resGetCustomerTxns.message,
            };
        }

        return {
            success: true,
            data: resGetCustomerTxns.data,
        };
    }

    async getCustomerMfPortfolio(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };
        // const payload = {
        //     userId: '64edfe606ef9201fcb1574d2',
        //     email: 'aniketpathak29@gmail.com',
        // };

        const customerMfPortfolio = await this.mutualFundService.getMfPortfolio(
            customer.pan_number,
            payload,
        );

        if (customerMfPortfolio.success) {
            const response = customerMfPortfolio.data.portfolio;

            return {
                success: true,
                data: response,
            };
        } else {
            return {
                success: false,
                message: 'could not fetch customer mutual-funds portfolio',
            };
        }
    }

    async getTransactionTimelineData(customer_id: string): Promise<ResProps> {
        const mutualFundData = await this.mutualFundService.getTransactionTimelineData(customer_id);
        return {
            success: true,
            data: mutualFundData,
        };
    }

    async getMfTaxReportData(
        customer_id: string,
        getTaxFillingDto: GetTaxFillingDto,
    ): Promise<ResProps> {
        const mutualFundData = await this.mutualFundService.getMfTaxReportData(
            customer_id,
            getTaxFillingDto,
        );
        return {
            success: true,
            data: mutualFundData,
        };
    }

    async getMfTaxChartData(customer_id: string): Promise<ResProps> {
        const mutualFundData = await this.mutualFundService.getMfTaxChartData(customer_id);
        return {
            success: true,
            data: mutualFundData,
        };
    }

    async getMutualFundsPayment(payment_id: string) {
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

        return {
            success: true,
            data: payment,
        };
    }

    async getTransactionInFlowData(
        customer_id: string,
        getSwitchInTransactionsDto: GetSwitchInOutTransactionsDto,
    ): Promise<ResProps> {
        const mutualFundData = await this.mutualFundService.getTransactionInFlowData(
            customer_id,
            getSwitchInTransactionsDto,
        );
        return {
            success: true,
            data: mutualFundData,
        };
    }

    async getTransactionOutFlowData(
        customer_id: string,
        getSwitchOutTransactionsDto: GetSwitchInOutTransactionsDto,
    ): Promise<ResProps> {
        const mutualFundData = await this.mutualFundService.getTransactionOutFlowData(
            customer_id,
            getSwitchOutTransactionsDto,
        );
        return {
            success: true,
            data: mutualFundData,
        };
    }

    private async sendEmailCode(email: string): Promise<string> {
        const { token, secret } = await this.getOneTimePassword();

        await this.mailerService.sendTemplateEmail({
            template_name: 'onetime-password.hbs',
            template_params: { token },
            subject: 'InCred Money | OTP for email verification',
            to_emails: [email],
        });

        return secret;
    }

    private async sendPhoneCode(phoneCode: string, phoneNumber: string): Promise<string> {
        const { token, secret } = await this.getOneTimePassword();

        await this.msg91Service
            // Sending OTP to phone number.
            .sendMessage(`${phoneCode}${phoneNumber}`, token)
            .catch((error) => {
                // TODO - Send notification to dev team
                console.log('🚀 ~ file: ~ PaymentService ~ .then ~ err:', error);
            });

        return secret;
    }

    async verifyCustomerConsentOtp(
        params: VerifyPaymentOtpDto,
        payment_id: string,
    ): Promise<ResProps> {
        try {
            const { phone_otp, email_otp } = params;
            const payment = await this.paymentModel.findOne({ _id: payment_id });

            if (!payment) {
                return {
                    success: false,
                    message: 'Payment not found.',
                };
            }

            const customer = await this.customerModel.findOne({ _id: payment.customer_id });

            if (!customer) {
                return {
                    success: false,
                    message: 'Customer not found.',
                };
            }

            if (
                (await bcrypt.compare(email_otp, payment.email_secret)) &&
                (await bcrypt.compare(phone_otp, payment.phone_secret))
            ) {
                if (payment.product_type === ProductType.MUTUAL_FUND) {
                    if (payment.mutual_fund_details.sub_type === MfSubType.LUMPSUM) {
                        const resCheckoutMf = await this.checkoutMutualFunds(payment.id);
                        if (!resCheckoutMf.success) {
                            return {
                                success: false,
                                message: resCheckoutMf?.message,
                            };
                        }
                    }

                    if (payment.mutual_fund_details.sub_type === MfSubType.REDEMPTION) {
                        const resChekoutRedemption = await this.checkoutRedemption(payment.id);

                        if (!resChekoutRedemption.success) {
                            return {
                                success: false,
                                message: resChekoutRedemption?.message,
                            };
                        }
                    }
                    if (payment.mutual_fund_details.sub_type === MfSubType.SWP) {
                        const resChekoutSwp = await this.checkoutSwp(payment.id);

                        if (!resChekoutSwp.success) {
                            return {
                                success: false,
                                message: resChekoutSwp?.message,
                            };
                        }
                    }

                    if (
                        payment.mutual_fund_details.sub_type === MfSubType.SWITCH_IN ||
                        payment.mutual_fund_details.sub_type === MfSubType.SWITCH_OUT
                    ) {
                        const resCheckoutSwitch = await this.checkoutSwitch(payment.id);

                        if (!resCheckoutSwitch.success) {
                            return {
                                success: false,
                                message: resCheckoutSwitch?.message,
                            };
                        }
                    }

                    if (
                        payment.mutual_fund_details.sub_type === MfSubType.STP_IN ||
                        payment.mutual_fund_details.sub_type === MfSubType.STP_OUT
                    ) {
                        const resCheckoutStp = await this.checkoutStp(payment.id);

                        if (!resCheckoutStp.success) {
                            return {
                                success: false,
                                message: resCheckoutStp?.message,
                            };
                        }
                    }
                }

                payment.is_approved = true;
                await payment.save();

                return { success: true, message: 'Consent Given Successfully' };
            } else {
                throw new BadRequestException('Invalid OTP');
            }
        } catch (error) {
            console.error('🚀 ~ verifyCustomerConsentOtp ~ error:', error);
            throw new Error('Failed to verify consent OTP: ' + error.message);
        }
    }
}
