import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from 'src/models/payment.model';
import { GetPamentsReqDto } from './dto/request/get-payments.req.dto';
import { OrderStatus } from 'src/constants/payment.const';
import { Customer, CustomerDocument, ConnectionType } from 'src/models/customer.model';
import { CreatePaymentReqDto } from './dto/request/create-payment.req.dto';
import { SessionAccount } from 'src/constants/account.const';
import BondsService from 'src/services/bonds.service';
import { ProductType, SessionProduct } from 'src/constants/product.const';
import { ResProps } from 'src/constants/constants';
import { PaymentResDto } from './dto/response/payment.res.dto';
import { CreateIpoPaymentDto } from './dto/request/create-ipo-payment.dto';
import { eachSeries } from 'async';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from 'src/models/user.model';
import { Types } from 'mongoose';
import IpoService from 'src/services/initial-public-offer.service';
import MailerService from 'src/services/mailer.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private bondsService: BondsService,
        private mailerService: MailerService,
        private configService: ConfigService,
        private ipoService: IpoService,
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

    async getPayments(account_id: string, query: GetPamentsReqDto): Promise<ResProps> {
        const queryParams: any = { account_id };

        if (query.status) {
            queryParams.status = query.status;
        }

        const [totalPayments, payments] = await Promise.all([
            this.paymentModel.countDocuments(queryParams),
            this.paymentModel
                .find(queryParams)
                .sort({ created_at: 'desc' })
                .skip((query.page - 1) * query.per_page)
                .limit(query.per_page),
        ]);

        return {
            success: true,
            data: {
                total_count: totalPayments,
                collection: payments.map((payment) => {
                    return new PaymentResDto(payment.toJSON());
                }),
            },
        };
    }

    async createPayment(
        session: SessionAccount,
        customer: CustomerDocument,
        product: SessionProduct,
        params: CreatePaymentReqDto,
    ): Promise<ResProps> {
        const paymentParams = { ...params };
        paymentParams['account_id'] = session.account_id;
        paymentParams['advisor_id'] = session.user_id;
        paymentParams['customer_name'] = customer.name;
        paymentParams['customer_email'] = customer.email;
        paymentParams['demat_number'] = customer.demat_number;
        paymentParams['product_code'] = product.code;
        paymentParams['product_name'] = product.name;
        paymentParams['product_isin'] = product.isin;
        paymentParams['product_type'] = product.type;
        paymentParams['product_issuer'] = product.issuer;

        const resGetProductPrice = await this.bondsService.getProductPrice({
            product_code: product.code,
            units: params.units,
            return_rate: params.return_rate,
        });

        console.log('🚀 ~ PaymentsService ~ resGetProductPrice:', resGetProductPrice);

        if (!resGetProductPrice.success) {
            return {
                success: false,
                message:
                    resGetProductPrice.message ??
                    'Product price is not available, please try again.',
            };
        }

        const { data: resUnitPrice } = resGetProductPrice;

        paymentParams['unit_price'] = resUnitPrice?.Price;
        paymentParams['user_amount'] = resUnitPrice?.userAmount;

        console.log('🚀 ~ PaymentsService ~ paymentParams:', paymentParams);

        const payment = await this.paymentModel.create(paymentParams);

        try {
            const access = await this.bondsService.refreshToken(customer);
            customer.setConnectionValue(ConnectionType.ICM, 'access_token', access.data.token);

            const order = await this.bondsService.createOrder(
                payment,
                customer,
                session.account_code,
            );

            console.log('🚀 ~ PaymentsService ~ createPayment ~ order:', order);

            if (!order.success) {
                return {
                    success: false,
                    message: order.message,
                };
            }

            payment['foreign_id'] = order.data._id;
            payment['order_id'] = order.data.orderId;
            payment['ordered_at'] = new Date(order.data.createdAt * 1000).toUTCString();
            payment['product_type'] = order.data.productType;
            payment['dp_name'] = order.data.dpName;
            payment['metadata'] = order.data;
            payment['status'] = OrderStatus.DIGIO_DOC_OPENED;
            await payment.save();

            const resGetPaymentLink = await this.bondsService.getPaymentLink(payment, customer);

            console.log(
                '🚀 ~ PaymentsService ~ createPayment ~ resGetPaymentLink:',
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
                data: new PaymentResDto({
                    ...payment.toJSON(),
                    ...resGetPaymentLink.data,
                }),
            };
        } catch (error) {
            console.log('🚀 ~ PaymentsService ~ createPayment ~ error:', error);

            return {
                success: false,
                error: error,
                message: error.message ?? 'Could not create your order, please contact support.',
            };
        }
    }

    async getPayment(payment_id: string) {
        const payment = await this.paymentModel.findOne({ _id: payment_id });

        if (!payment) {
            return {
                success: false,
                message: 'Order not found.',
            };
        }

        const customer = await this.customerModel
            .findOne({ _id: payment.customer_id })
            .select('connections');

        const access = await this.bondsService.refreshToken(customer);
        const resGetProductTxns = await this.bondsService.getProductTxns(
            payment.product_code,
            access.data.token,
        );

        if (!resGetProductTxns.success) {
            return {
                success: true,
                data: new PaymentResDto(payment.toJSON()),
                message: 'Could not sync at the moment, please try again.',
            };
        }

        const { data: productTxns } = resGetProductTxns;

        await productTxns.forEach((trxn) => {
            if (payment.order_id == trxn.orderId) {
                payment['status'] = trxn.status;
                payment.save();
            }
        });

        return {
            success: true,
            data: new PaymentResDto(payment.toJSON()),
        };
    }

    async createIpoPayment(session: SessionAccount, params: CreateIpoPaymentDto) {
        const customer = await this.customerModel.findOne({ _id: params.customer_id });

        if (params.customer_upi) {
            customer.upi_id = params.customer_upi;
            await customer.save();
        }

        const paymentParams = {};
        paymentParams['advisor_id'] = session.user_id;
        paymentParams['account_id'] = session.account_id;
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

                    const clientUrl = this.configService.get<string>('CLIENT_URL');
                    const consentUrl = `${clientUrl}/payments/ipo/${paymentParams['group_id']}`;

                    resolve({ success: true, message: consentUrl });
                },
            );
        });
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
}
