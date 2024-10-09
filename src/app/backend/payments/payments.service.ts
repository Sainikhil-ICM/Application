import { eachSeries } from 'async';
import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import MailerService from 'src/services/mailer.service';
import BondsService from 'src/services/bonds.service';
import Msg91Service from 'src/services/msg91.service';
import IpoService from 'src/services/initial-public-offer.service';
import UtilityService from 'src/services/utility.service';

import { SessionUser } from 'src/constants/user.const';
import {
    CartType,
    OrderStatus,
    ScheduleType,
    SyncOrderStatusMap,
} from 'src/constants/payment.const';
import { QueueName, ResProps } from 'src/constants/constants';
import { ProductType } from 'src/constants/product.const';
import { AccessControlList } from 'src/constants/access-control.const';

import { Payment, PaymentDocument } from 'src/models/payment.model';
import { Customer, CustomerDocument, ConnectionType } from 'src/models/customer.model';
import { Account, AccountDocument } from 'src/models/account.model';
import { User, UserDocument } from 'src/models/user.model';

import { CustomerSyncEvent } from './events/customer-sync.event';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPamentsDto } from './dto/get-payments.dto';
import { CreateIpoPaymentDto } from './dto/create-ipo-payment.dto';
import { ConfirmIpoPaymentDto } from './dto/confirm-ipo-payment.dto';
import { SendPaymentConsentOtp } from './dto/send-payment-consent-otp.dto';
import { VerifyPaymentConsentOtp } from './dto/verify-payment-consent-otp.dto';
import { UserLink, UserLinkDocument } from 'src/models/user-link.model';
import UnlistedEquityService from 'src/services/unlisted-equity/unlisted-equity.service';
import MutualFundService from 'src/services/mutual-fund/mutual-fund.service';
import { JwtService } from '@nestjs/jwt';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.req.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OrderCreatedEventDto } from 'src/listeners/dto/order-created-event.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectQueue(QueueName.PRODUCTS_QUEUE)
        private productsQueue: Queue,

        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(UserLink.name)
        private readonly userLinkModel: Model<UserLinkDocument>,

        private readonly unlistedEquityService: UnlistedEquityService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly bondsService: BondsService,
        private readonly mutualFundService: MutualFundService,
        private readonly ipoService: IpoService,
        private readonly msg91Service: Msg91Service,
        private readonly utilityService: UtilityService,
        private readonly eventEmitter: EventEmitter2,
        private readonly jwtService: JwtService,
    ) {}

    ipoStatusMap = {
        created: OrderStatus.ORDER_CREATED,
        prebook: OrderStatus.ORDER_PREBOOKED,
        pending: OrderStatus.ORDER_PENDING,
        failed: OrderStatus.ORDER_FAILED,
        cancelled: OrderStatus.ORDER_CANCELLED,
        rejected: OrderStatus.ORDER_REJECTED,
        success: OrderStatus.ORDER_SUCCESS,
    };

    arrayIncludes = this.utilityService.arrayIncludes;

    private async getReporteeIds(
        managerIds: string[],
        memo: string[] = [],
        retries = 5,
    ): Promise<string[]> {
        const userIds = [...new Set([...memo, ...managerIds])];
        const reporteeIds = await this.userLinkModel
            .distinct('reportee_id', { manager_id: { $in: managerIds } })
            .then((ids) => ids.map((id) => String(id)));

        // Adding retries to avoid infinite loop.
        if (reporteeIds.length && retries > 0) {
            return await this.getReporteeIds(reporteeIds, userIds, retries - 1);
        }

        return userIds;
    }

    async getPayments(session: SessionUser, query: GetPamentsDto): Promise<ResProps> {
        const queryParams = {};

        const accessControlList = [
            AccessControlList.LIST_ORDERS,
            AccessControlList.LIST_ACCOUNT_ORDERS,
            AccessControlList.LIST_MANAGED_ORDERS,
            AccessControlList.LIST_USER_ORDERS,
        ];

        if (!this.utilityService.arrayIncludes(accessControlList, session.roles)) {
            return {
                success: false,
                message: 'You do not have access to this resource.',
            };
        }

        if (session.roles.includes(AccessControlList.LIST_ACCOUNT_ORDERS)) {
            queryParams['account_id'] = session.account_id;
        } else if (session.roles.includes(AccessControlList.LIST_MANAGED_ORDERS)) {
            queryParams['account_id'] = session.account_id;

            const reporteeIds = await this
                // Commenting helps keep this code in multiple lines.
                .getReporteeIds([String(session.user_id)])
                .then((ids) => ids.map((id) => new Types.ObjectId(id)));

            queryParams['advisor_id'] = { $in: reporteeIds };
        } else if (session.roles.includes(AccessControlList.LIST_USER_ORDERS)) {
            queryParams['account_id'] = session.account_id;
            queryParams['advisor_id'] = session.user_id;
        }

        if (query.status) {
            if (query.status === 'PENDING') {
                queryParams['status'] = {
                    $in: [
                        OrderStatus.ORDER_PENDING,
                        OrderStatus.ORDER_PREBOOKED,
                        OrderStatus.ORDER_INITIATED,
                        OrderStatus.PAYMENT_LINK_SENT,
                        OrderStatus.PAYMENT_LINK_OPENED,
                        OrderStatus.DIGIO_DOC_OPENED,
                        OrderStatus.DIGIO_DOC_SENT,
                        OrderStatus.DIGIO_SIGN_SUCCESS,
                    ],
                };
            } else {
                queryParams['status'] = query.status;
            }
        }

        if (query.customer_id) {
            queryParams['customer_id'] = query.customer_id;
        }

        if (query.customer_name) {
            queryParams['customer_name'] = { $regex: new RegExp(query.customer_name, 'i') };
        }
        if (query.product_type && query.product_type !== ProductType.UNLISTED_EQUITY) {
            queryParams['product_type'] = query.product_type;
        }

        const [payments] = await this.paymentModel.aggregate([
            { $match: { ...queryParams } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [
                        { $sort: { created_at: -1 } },
                        { $skip: (query.page - 1) * query.per_page },
                        { $limit: query.per_page },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                customer_id: 1,
                                customer_name: 1,
                                demat_number: 1,
                                product_name: 1,
                                product_type: 1,
                                product_code: 1,
                                units: 1,
                                type: 1,
                                user_amount: 1,
                                status: 1,
                                order_id: 1,
                                transaction_date: '$created_at',
                                product_isin: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    collection: 1,
                    total_count: { $first: '$total.count' },
                },
            },
        ]);

        return {
            success: true,
            data: {
                ...payments,
                page: query.page,
                per_page: query.per_page,
            },
        };
    }

    async getPaymentsInLastHours(hours: number): Promise<ResProps> {
        const queryParams = {};

        if (hours !== -1) {
            const now = new Date();
            const hoursAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);
            queryParams['created_at'] = { $gte: hoursAgo };
        }

        const payments = await this.paymentModel
            .find(queryParams)
            .sort({ created_at: 'desc' })
            .populate({ path: 'account', select: 'code' })
            .populate({ path: 'advisor', select: 'name' });

        return { success: true, data: payments };
    }

    async getIpoPayment(group_id: string) {
        const payments = await this.paymentModel.find({ group_id });

        if (payments.length === 0) {
            return {
                success: false,
                message: 'Payment link is expired, please contact your IFA.',
            };
        }

        const customer = await this.customerModel
            .findOne({ _id: payments[0].customer_id })
            .select('name phone_number demat_number upi_id');

        return new Promise((resolve, reject) => {
            eachSeries(
                payments,
                async (payment, next) => {
                    if (payment.status == OrderStatus.PAYMENT_LINK_SENT) {
                        payment.status = OrderStatus.PAYMENT_LINK_OPENED;
                        await payment.save();
                    }
                    return;
                },
                (err) => {
                    if (err) {
                        reject({
                            success: false,
                            error: err,
                            message:
                                err.message ?? 'Payment link is expired, please contact your IFA.',
                        });
                    }

                    resolve({
                        success: true,
                        data: { customer, payments },
                    });
                },
            );
        });
    }

    async syncIpoPayment(payment_id: string) {
        const payment = await this.paymentModel
            .findOne({ _id: payment_id })
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

        try {
            const access = await this.bondsService.refreshToken(payment.customer);
            const order = await this.ipoService.getPurchaseOrder(
                payment.order_id,
                access.data.token,
            );

            console.log(
                '🚀 ~ file: payments.service.ts:168 ~ PaymentsService ~ syncIpoPayment ~ order:',
                order,
            );

            if (!order.success) {
                return {
                    success: false,
                    message: order.message ?? 'Could not sync the transaction details.',
                };
            }

            return new Promise((resolve) => {
                eachSeries(
                    order.data,
                    async (series, _next) => {
                        console.log(
                            '🚀 ~ file: payments.service.ts:190 ~ syncIpoPayment ~ series:',
                            { status: this.ipoStatusMap[series.status] },
                        );

                        await this.paymentModel.updateOne(
                            { order_id: series.orderId },
                            { status: this.ipoStatusMap[series.status] },
                        );
                        return;
                    },
                    (_err) => {
                        resolve({
                            success: true,
                            message: 'IPO application status is successfully synced.',
                        });
                    },
                );
            });
        } catch (error) {
            console.log(
                '🚀 ~ file: payments.service.ts:174 ~ PaymentsService ~ syncIpoPayment ~ error:',
                error,
            );
            return { ...error.response, success: false };
        }
    }

    async cancelIpoPayment(payment_id: string) {
        const payment = await this.paymentModel
            .findOne({ _id: payment_id })
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

        try {
            const access = await this.bondsService.refreshToken(payment.customer);
            const order = await this.ipoService.cancelPurchaseOrder(
                payment.order_id,
                access.data.token,
            );

            console.log(
                '🚀 ~ file: payments.service.ts:239 ~ PaymentsService ~ cancelIpoPayment ~ order:',
                order,
            );

            if (!order.success) {
                return {
                    success: false,
                    message: order.message ?? 'Order could not be calcelled at the moment.',
                };
            }

            return new Promise((resolve) => {
                eachSeries(
                    order.data,
                    async (series, _next) => {
                        console.log(
                            '🚀 ~ file: payments.service.ts:256 ~ cancelIpoPayment ~ series:',
                            { status: this.ipoStatusMap[series.status] },
                        );

                        await this.paymentModel.updateOne(
                            { order_id: series.orderId },
                            { status: this.ipoStatusMap[series.status] },
                        );
                        return;
                    },
                    (_err) => {
                        resolve({
                            success: true,
                            message: 'IPO application has been cancelled.',
                        });
                    },
                );
            });
        } catch (error) {
            console.log(
                '🚀 ~ file: payments.service.ts:174 ~ PaymentsService ~ cancelIpoPayment ~ error:',
                error,
            );
            return { ...error.response, success: false };
        }
    }

    async createPayment(user: SessionUser, params: CreatePaymentDto) {
        // TODO: Add RM details in the user email.
        const customer = await this.customerModel.findOne({ _id: params.customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const productDetails = await this.bondsService.getProduct(params.product_isin);

        if (productDetails.data.category !== 'live') {
            return {
                success: false,
                message: 'Product is not live, please contact support.',
            };
        }

        const resGetProductPrice = await this.bondsService.getProductPrice(params);

        console.log(
            '🚀 ~ file: payments.service.ts:345 ~ PaymentsService ~ resGetProductPrice:',
            resGetProductPrice,
        );

        if (!resGetProductPrice.success) {
            return {
                success: false,
                message:
                    resGetProductPrice.message ??
                    'Product price is not available, please try again.',
            };
        }

        const productPrice = resGetProductPrice.data;

        // Syncing customer details with ICMB.
        this.eventEmitter.emit('customer.sync', new CustomerSyncEvent(customer));

        const newPayment = new this.paymentModel({});

        newPayment.set('advisor_id', user.user_id);
        newPayment.set('account_id', user.account_id);
        newPayment.set('customer_name', customer.name);
        newPayment.set('customer_email', customer.email);
        newPayment.set('customer_id', customer.id);
        newPayment.set('demat_number', customer.demat_number);
        newPayment.set('product_isin', params.product_isin);
        newPayment.set('product_name', params.product_name);
        newPayment.set('product_code', params.product_code);
        newPayment.set('product_type', params.product_type);
        newPayment.set('units', params.units);
        newPayment.set('unit_price', productPrice?.Price);
        newPayment.set('user_amount', productPrice?.userAmount);
        newPayment.set('message', params.message);
        newPayment.set('product_issuer', params.product_issuer);
        newPayment.set('return_rate', params.return_rate);

        await newPayment.save();

        // Sending payment link to customer email.
        this.eventEmitter.emit('order.created', new OrderCreatedEventDto(newPayment.toJSON()));

        return {
            success: true,
            message: 'Payment link successfully sent.',
        };
    }

    async confirmIpoPayment(params: ConfirmIpoPaymentDto): Promise<ResProps> {
        console.log(
            '🚀 ~ file: payments.service.ts:273 ~ PaymentsService ~ confirmIpoPayment ~ params:',
            params,
        );

        const payments = await this.paymentModel.find({ group_id: params.group_id });
        console.log(
            '🚀 ~ file: payments.service.ts:353 ~ PaymentsService ~ confirmIpoPayment ~ payments:',
            payments,
        );

        const customer = await this.customerModel.findOne({ _id: params.customer_id });
        const account = await this.accountModel.findOne({ _id: params.account_id });

        console.log(
            '🚀 ~ file: payments.service.ts:273 ~ PaymentsService ~ confirmIpoPayment ~ customer:',
            customer,
        );

        if (!customer || payments.length === 0) {
            return {
                success: false,
                message: 'Could not place your bid, please contact your IFA.',
            };
        }

        try {
            const access = await this.bondsService.refreshToken(customer);

            // Setting WhatsApp consent to true.
            await this.bondsService.setWhatsAppConsent(true, access.data.token);

            if (!access.success) {
                return {
                    success: false,
                    message: 'Service not available, please try again later.',
                };
            }

            const order = await this.ipoService.purchaseIpoOrder(
                {
                    payments: payments,
                    account_code: account.code,
                    product_isin: params.product_isin,
                    customer_upi: customer.upi_id,
                },
                access.data.token,
            );

            console.log(
                '🚀 ~ file: payments.service.ts:296 ~ PaymentsService ~ confirmIpoPayment ~ order:',
                order,
            );

            if (!order.success) {
                if (order.message?.includes('1000000')) {
                    await this.paymentModel.updateMany(
                        { group_id: params.group_id },
                        { status: OrderStatus.ORDER_LIMIT_REACHED },
                    );
                }

                if (order.message?.includes('Maximum 5 bids')) {
                    await this.paymentModel.updateMany(
                        { group_id: params.group_id },
                        { status: OrderStatus.ORDER_LIMIT_REACHED },
                    );
                }

                return {
                    success: false,
                    message: order.message ?? 'Could not place your bid, please contact your IFA.',
                };
            }

            return new Promise((resolve, reject) => {
                eachSeries(
                    order.data.at(0).series,
                    async (series, next) => {
                        const paymentParams = {};
                        paymentParams['foreign_id'] = series._id;
                        paymentParams['group_order_id'] = series.groupOrderId;
                        paymentParams['dp_name'] = series.dpName;
                        paymentParams['metadata'] = series;
                        paymentParams['order_id'] = series.orderId;
                        paymentParams['ordered_at'] = series.timeStamp;
                        paymentParams['units'] = series.amountBreakup.units;
                        paymentParams['unit_price'] = series.amountBreakup.unitPrice;
                        paymentParams['user_amount'] = series.amountBreakup.userAmount;
                        paymentParams['status'] = this.ipoStatusMap[series.status];

                        console.log(
                            '🚀 ~ file: payments.service.ts:181 ~ PaymentsService ~ createIpoPayment ~ paymentParams:',
                            paymentParams,
                        );

                        await this.paymentModel.updateOne(
                            {
                                customer_id: customer.id,
                                group_id: params.group_id,
                                product_isin: series.ISIN,
                            },
                            { ...paymentParams },
                        );
                        return;
                    },
                    (err) => {
                        if (err) {
                            reject({
                                success: false,
                                message:
                                    err.message ??
                                    'Could not place your bid, please try again later.',
                            });
                        }

                        resolve({
                            success: true,
                            message: 'IPO application is successfully submitted.',
                        });
                    },
                );
            });
        } catch (error) {
            console.log(
                '🚀 ~ file: payments.service.ts:214 ~ PaymentsService ~ createIpoPayment ~ error:',
                error,
            );

            return {
                success: false,
                error: error,
                message: error.message ?? 'Could not place your bid, please try again later.',
            };
        }
    }

    async createIpoPayment(user: SessionUser, params: CreateIpoPaymentDto) {
        console.log('🚀 ~ PaymentsService ~ sendIpoConsent ~ params:', params);

        const customer = await this.customerModel.findOne({ _id: params.customer_id });

        const productDetails = await this.bondsService.getProduct(params.group_isin);
        if (productDetails.data.category !== 'live') {
            return {
                success: false,
                message: 'Product is not live',
            };
        }
        if (!customer) {
            throw new NotFoundException('Customer not found.');
        }

        if (params.customer_upi) {
            customer.upi_id = params.customer_upi;
            await customer.save();
        }

        const paymentParams = {};
        paymentParams['advisor_id'] = user.user_id;
        paymentParams['account_id'] = user.account_id;
        paymentParams['group_id'] = new Types.ObjectId();
        paymentParams['group_isin'] = params.group_isin;

        paymentParams['customer_id'] = customer.id;
        paymentParams['customer_name'] = customer.name;
        paymentParams['customer_email'] = customer.email;
        paymentParams['customer_upi'] = params.customer_upi;
        paymentParams['demat_number'] = customer.demat_number;

        const bidAmount = Object.values(params.product_series).reduce(
            (total: number, item: any) => total + item.user_amount,
            0,
        );

        console.log('🚀 ~ PaymentsService ~ createIpoPayment ~ bidAmount:', bidAmount);

        return new Promise((resolve, reject) => {
            eachSeries(
                params.product_series,
                async (series, next) => {
                    paymentParams['product_isin'] = series.isin;
                    paymentParams['product_name'] = series.name;
                    paymentParams['product_code'] = series.code;
                    paymentParams['product_issuer'] = series.issuer;
                    paymentParams['product_type'] = ProductType.IPO;
                    paymentParams['units'] = series.units;
                    paymentParams['unit_price'] = series.unit_price;
                    paymentParams['user_amount'] = series.user_amount;

                    console.log(
                        '🚀 ~ file: payments.service.ts:184 ~ PaymentsService ~ paymentParams:',
                        paymentParams,
                    );

                    await this.paymentModel.create({ ...paymentParams });
                    return;
                },
                async (err) => {
                    if (err) {
                        reject({
                            error: err,
                            success: false,
                            message:
                                err.message ?? 'Could not place your bid, please try again later.',
                        });
                    }

                    let resMessage = `The application for IPO has been placed, please check your email for further instructions`;

                    // Send consent link if bid amount is less than 10L.
                    if (bidAmount < 1000000) {
                        const clientUrl = this.configService.get<string>('CLIENT_URL');
                        const consentUrl = `${clientUrl}/payments/ipo/${paymentParams['group_id']}`;
                        resMessage = `Consent link successfully sent to ${customer.email}.`;

                        const advisor = await this.userModel.findById(user.user_id).select('name');

                        await this.mailerService.sendTemplateEmail({
                            template_name: 'payment-link.hbs',
                            template_params: {
                                ...customer,
                                action_url: consentUrl,
                                advisor_name: advisor.name,
                            },
                            subject: 'InCred Money | Transaction Initiated',
                            to_emails: [customer.email],
                        });
                    } else {
                        await this.confirmIpoPayment({
                            group_id: paymentParams['group_id'],
                            product_isin: params.group_isin,
                            customer_id: customer.id,
                            account_id: String(user.account_id),
                        });
                    }

                    resolve({ success: true, message: resMessage });
                },
            );
        });
    }

    async getPaymentDetails(payment_id: string) {
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

        try {
            const resGetCustomerId = await this.bondsService.getCustomerId(
                payment.customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
            );

            console.log(
                '🚀 ~ PaymentsService ~ getPaymentDetails ~ resGetCustomerId:',
                resGetCustomerId,
            );

            // ICMB cutomer id is required to make payment.
            if (!resGetCustomerId.success) {
                return {
                    success: false,
                    message: 'Payment link expired, please contact your advisor.',
                };
            }

            if (!resGetCustomerId.data.length) {
                return {
                    success: false,
                    message: 'Customer KYC is not completed, please contact your advisor.',
                };
            }

            // Updating the ICMB customer id.
            payment.customer.setConnectionValue(
                ConnectionType.ICM,
                'kyc_id',
                resGetCustomerId.data.at(0)?.custId,
            );
            await payment.customer.save();

            const resGetInvestmentAmount = await this.bondsService.getInvestmentAmount(
                payment,
                payment.customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
            );

            console.log(
                '🚀 ~ PaymentsService ~ getPaymentDetails ~ resGetInvestmentAmount:',
                resGetInvestmentAmount,
            );

            if (!resGetInvestmentAmount.success) {
                throw new NotFoundException(resGetInvestmentAmount.message);
            }

            payment.set('user_amount', resGetInvestmentAmount.data.userAmount);

            if (payment.status == OrderStatus.PAYMENT_LINK_SENT) {
                payment.set('status', OrderStatus.PAYMENT_LINK_OPENED);
            }

            await payment.save();

            return {
                success: true,
                data: {
                    payment,
                    investment: resGetInvestmentAmount.data,
                },
            };
        } catch (err) {
            return {
                success: false,
                message: err.message,
            };
        }
    }

    async getPaymentLink(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        const account = await this.accountModel
            .findOne({ _id: payment.account_id })
            .select('status code');

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel
            .findOne({ _id: payment.customer_id })
            .select('name email pan_number demat_number connections');

        const resCreateOrder = await this.bondsService.createOrder(payment, customer, account.code);
        console.log('🚀 ~ PaymentsService ~ getPaymentLink ~ resCreateOrder:', resCreateOrder);

        if (!resCreateOrder.success) {
            return {
                success: false,
                message: resCreateOrder.message,
            };
        }

        const orderData = resCreateOrder.data;

        enum ProductTypeMap {
            ipo = 'IPO',
            bonds = 'BOND',
            mld = 'MLD',
            mutualfund = 'MUTUAL_FUND',
        }

        debugger;
        payment.set('foreign_id', orderData._id);
        payment.set('order_id', orderData.orderId);
        payment.set('ordered_at', new Date(orderData.createdAt * 1000));
        payment.set('product_type', ProductTypeMap[orderData.productType]);
        payment.set('dp_name', orderData.dpName);
        payment.set('metadata', orderData);
        payment.set('status', OrderStatus.DIGIO_DOC_OPENED);

        await payment.save();

        const resGetPaymentLink = await this.bondsService.getPaymentLink(payment, customer);
        console.log(
            '🚀 ~ PaymentsService ~ getPaymentLink ~ resGetPaymentLink:',
            resGetPaymentLink,
        );

        if (!resGetPaymentLink.success) {
            return {
                success: false,
                message: resGetPaymentLink.message,
            };
        }

        return {
            success: true,
            payment_link: resGetPaymentLink.data.eSigningUrl,
        };
    }

    async syncPayment(payment_id: string) {
        const payment = await this.paymentModel
            .findById(payment_id)
            .populate<{ customer: CustomerDocument }>({
                path: 'customer',
                select: 'connections',
            });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const { data: access } = await this.bondsService.refreshToken(payment.customer);
        let trxns;
        if (payment.product_type === ProductType.UNLISTED_EQUITY) {
            // trxns = await this.unlistedEquityService.getUnlistedEquityTxns(
            //     payment.product_isin,
            //     payment.order_id,
            //     access.token,
            // );
        } else {
            trxns = await this.bondsService.getProductTxns(payment.product_code, access.token);
        }

        console.log(
            '🚀 ~ file: payments.service.ts:775 ~ PaymentsService ~ syncPayment ~ trxns:',
            trxns,
        );

        if (!trxns.success) {
            return {
                success: false,
                message: "Couldn't sync at the moment, please try again later.",
            };
        }

        await trxns.data.forEach((trxn) => {
            if (payment.order_id == trxn.orderId) {
                if (payment.product_type === ProductType.UNLISTED_EQUITY) {
                    if (trxn.status === 'success') {
                        payment['status'] =
                            trxn?.adminStatus === 'accepted'
                                ? SyncOrderStatusMap[trxn.status]
                                : OrderStatus.PAYMENT_SUCCESS;
                    } else {
                        payment['status'] = SyncOrderStatusMap[trxn.status];
                    }
                } else {
                    payment['status'] = SyncOrderStatusMap[trxn.status];
                }

                if (trxn.txnId) {
                    payment['transaction_id'] = trxn.txnId;
                }

                payment.save();
            }
        });

        return {
            success: true,
            message: 'Payment synced successfully.',
        };
    }

    /**
     * Sending OTP to customer for payment consent.
     * @param params
     * @returns
     */
    async sendPaymentConsentOtp(params: SendPaymentConsentOtp) {
        const customer = await this.customerModel
            .findOne({ _id: params.customer_id })
            .select('id phone_number phone_code');

        return new Promise(async (resolve, reject) => {
            if (customer) {
                const payments = await this.paymentModel.find({ group_id: params.group_id });
                const token = Math.random().toString().substring(4, 8);
                const phoneSecret = await bcrypt.hash(token, 10);

                console.log('🚀 ~ sendPaymentConsentOtp ~ Token:', token);

                const phoneNumber = `${customer.phone_code}${customer.phone_number}`;
                await this.msg91Service.sendMessage(phoneNumber, token).catch((error) => {
                    // TODO - Send notification to dev team
                    console.log('🚀 ~ PaymentsService ~ sendPaymentConsentOtp ~ error:', error);
                });

                eachSeries(
                    payments,
                    async (payment, _next) => {
                        payment.consent_secret = phoneSecret;
                        await payment.save();
                        return;
                    },
                    (_err) => {
                        resolve({
                            success: true,
                            message: 'OTP sent successfully.',
                        });
                    },
                );
            } else {
                reject({
                    success: false,
                    message: 'Customer not found.',
                });
            }
        });
    }

    /**
     * Verify OTP for payment consent.
     * @param params
     * @returns
     */
    async verifyPaymentConsentOtp(params: VerifyPaymentConsentOtp) {
        return new Promise(async (resolve, reject) => {
            let isConsentGiven = false;

            const payments = await this.paymentModel
                .find({ group_id: params.group_id })
                .select('id consent_secret group_isin customer_id account_id');

            const confirmIpoParams = {} as ConfirmIpoPaymentDto;
            confirmIpoParams['group_id'] = params.group_id;

            eachSeries(
                payments,
                async (payment, _next) => {
                    confirmIpoParams['product_isin'] = payment.group_isin;
                    confirmIpoParams['customer_id'] = payment.customer_id;
                    confirmIpoParams['account_id'] = payment.account_id;

                    if (await bcrypt.compare(params.phone_otp, payment.consent_secret)) {
                        payment.is_consent_given = isConsentGiven = true;
                        await payment.save();
                        return;
                    }

                    isConsentGiven = false;
                    return;
                },
                async (_err) => {
                    if (isConsentGiven) {
                        console.log(
                            '🚀 ~ file: payments.service.ts:711 ~ PaymentsService ~ confirmIpoParams:',
                            confirmIpoParams,
                        );

                        const result = await this.confirmIpoPayment({ ...confirmIpoParams });

                        resolve({ ...result });
                    }

                    resolve({
                        success: false,
                        message: 'OTP did not match, please try again.',
                    });
                },
            );
        });
    }

    async updatePaymentStatus(
        payment_id: ObjectId,
        body: UpdatePaymentStatusDto,
    ): Promise<ResProps> {
        const payment = await this.paymentModel
            .findOne({ _id: payment_id })
            .select('id transaction_id customer_id');

        const customer = await this.customerModel
            .findOne({ _id: payment.customer_id })
            .select('connections');

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        if (!payment.transaction_id) {
            // TODO: Sync payment and update txn id.
            return {
                success: false,
                message: 'Transaction id not found.',
            };
        }

        const adminStatus = body.ops_status.toLowerCase();

        const resAcceptRejectTxn = await this.bondsService.acceptRejectTxn({
            ops_status: adminStatus === 'accept' ? 'accepted' : 'rejected',
            ops_remark: body.ops_remark,
            transaction_id: payment.transaction_id,
            customer_id: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id'),
        });

        console.log(
            '🚀 ~ PaymentsService ~ updatePayment ~ resAcceptRejectTxn:',
            resAcceptRejectTxn,
        );

        if (!resAcceptRejectTxn.success) {
            return {
                success: false,
                message: `Couldn't ${adminStatus} transaction, please contact support.`,
            };
        }

        return {
            success: true,
            message: `Transaction has been ${adminStatus}ed.`,
        };
    }

    async updatePayment(payment_id: ObjectId, body: UpdatePaymentDto): Promise<ResProps> {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        await this.paymentModel.findOneAndUpdate(
            { _id: payment_id },
            { ...body },
            { upsert: true },
        );

        return {
            success: true,
            message: 'Payment updated sucessfully',
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
                // Add other schedule types here
            };

            const getCartItems = getCartItemsMap[cart_type];
            const deleteCartItem = deleteCartItemMap[cart_type];

            if (!getCartItems || !deleteCartItem) {
                throw new Error(`Unsupported schedule type: ${cart_type}`);
            }

            const customerCart = await getCartItems();
            console.log('🚀 ~ PaymentsService ~ emptyCart ~ customerCart:', customerCart);

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
        } else {
            throw new Error('Unsupported frequency. Use "weekly" or "monthly".');
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

    async initiate2Fa(payment_id: ObjectId) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Payment not found.',
            };
        }

        const customer = await this.customerModel.findOne({ _id: payment.customer_id });

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

        const resInitiateTwoFactorAuth = await this.mutualFundService.initiateTwoFactorAuth(jwt);
        console.log(
            '🚀 ~ PaymentsService ~ initiate2Fa ~ resInitiateTwoFactorAuth:',
            resInitiateTwoFactorAuth,
        );

        if (!resInitiateTwoFactorAuth.success) {
            return {
                success: false,
                message: 'Could not initiate two factor authentication.',
                errors: [
                    {
                        code: 'INITIATE_2FA_FAILED',
                        message: resInitiateTwoFactorAuth.message,
                    },
                ],
            };
        }

        payment.set('is_consent_given', true);
        await payment.save();

        return {
            success: true,
            data: { authorisation_link: resInitiateTwoFactorAuth.data.ResponseString },
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
            '🚀 ~ PaymentsService ~ pollMutualFundsPayment ~ resGetPaymentLink:',
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
                '🚀 ~ PaymentsService ~ createChildOrder ~ createChildOrder:',
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
            '🚀 ~ PaymentsService ~ pollMutualFundsPayment ~ resGetPaymentLink:',
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

    async getOneTimePassword(): Promise<any> {
        const token = Math.random().toString().substring(4, 8);
        const secret = await bcrypt.hash(token, 10);

        console.log('🚀 ~ Login Token', token, secret);
        return { token, secret };
    }

    async sendPhoneCode(params: any): Promise<string> {
        const { phone_code, phone_number } = params;
        const { token, secret } = await this.getOneTimePassword();

        await this.msg91Service
            .sendMessage(`${phone_code}${phone_number}`, token)
            .catch((error) => {
                // TODO - Send notification to dev team
                console.log('🚀 ~ file: ~ PaymentService ~ .then ~ err:', error);
            });

        return secret;
    }

    async resendPhoneOtp(payment_id: string): Promise<ResProps> {
        try {
            const payment = await this.paymentModel.findOne({ _id: payment_id });

            const customer = await this.customerModel.findOne({ _id: payment.customer_id });

            if (customer) {
                const phoneSecret = await this.sendPhoneCode({
                    phone_number: customer.phone_number,
                    phone_code: customer.phone_code,
                    customer_id: customer.id,
                });

                payment.phone_secret = phoneSecret;
                await payment.save();
                return { success: true, message: 'Otp Sent' };
            } else {
                const message = `No Customer found`;
                throw new NotFoundException(message);
            }
        } catch (error) {
            console.error('🚀 ~ resendPhoneOtp ~ error:', error);
            throw new Error('Failed to send OTP: ' + error.message);
        }
    }

    async sendEmailCode(email: string): Promise<string> {
        const { token, secret } = await this.getOneTimePassword();

        await this.mailerService.sendTemplateEmail({
            template_name: 'onetime-password.hbs',
            template_params: { token },
            subject: 'InCred Money | OTP for email verification',
            to_emails: [email],
        });

        return secret;
    }

    async resendEmailOtp(payment_id: string): Promise<ResProps> {
        try {
            const payment = await this.paymentModel.findOne({ _id: payment_id });

            const customer = await this.customerModel.findOne({ _id: payment.customer_id });

            if (customer) {
                const emailSecret = await this.sendEmailCode(customer.email);

                payment.email_secret = emailSecret;
                await payment.save();
                return { success: true, message: 'Otp Sent' };
            } else {
                const message = `No user found`;
                throw new NotFoundException(message);
            }
        } catch (error) {
            console.error('🚀 ~ resendEmailOtp ~ error:', error);
            throw new Error('Failed to send OTP: ' + error.message);
        }
    }
}
