import { Injectable } from '@nestjs/common';
import {
    Customer,
    CustomerDocument,
    CustomerStatics,
    ConnectionType,
} from 'src/models/customer.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from 'src/models/payment.model';
import { OrderStatus } from 'src/constants/payment.const';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { CustomerStatusEvent } from './events/customer-status.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatusEvent } from './events/order-status.event';
import { Webhook, WebhookDocument } from 'src/models/webhook.model';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { ResProps } from 'src/constants/constants';
import { UserCustomer, UserCustomerDocument } from 'src/models/user-customer.model';
import { SessionUser } from 'src/constants/user.const';

@Injectable()
export class WebhooksService {
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument> & CustomerStatics,
        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(Webhook.name)
        private readonly webhookModel: Model<WebhookDocument>,
        @InjectModel(UserCustomer.name)
        private readonly userCustomerModel: Model<UserCustomerDocument>,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async createWebhook(session: SessionUser, body: CreateWebhookDto): Promise<ResProps> {
        const webhook = await this.webhookModel.findOneAndUpdate(
            { account_id: session.account_id },
            { events: body.events, url: body.url },
            { upsert: true, background: true, new: true },
        );

        return {
            success: true,
            data: webhook,
            message: 'Webhook created successfully.',
        };
    }

    async getWebhooks(session: SessionUser): Promise<ResProps> {
        const webhooks = await this.webhookModel
            .find({ account_id: session.account_id })
            .select('id url events account_id');

        return {
            success: true,
            data: {
                total_count: webhooks.length,
                collection: webhooks,
            },
        };
    }

    async updatePaymentDetails(data: any) {
        const paymentPicks = [
            'txnId',
            'adminRemark',
            'adminStatus',
            'date',
            'folioNu',
            'maturityDate',
            'nsdlChecked',
            'nsdlCheckedTimestamps',
            'paymentId',
            'paymentMode',
            'referralBenefits',
            'settlementDateStr',
            'status',
            'txnDate',
            'txnDateStr',
        ];

        const payment = await this.paymentModel.findOne({ order_id: data.orderId }).exec();

        if (payment) {
            payment['ops_remark'] = data.adminRemark;
            payment['ops_status'] = data.adminStatus;
            payment['date'] = data.date;
            payment['payment_mode'] = data.paymentMode;
            paymentPicks.forEach((key) => (payment['metadata'][key] = data[key]));
            payment['metadata']['digioDocDetails'] = data.digioDocDetails;
            // payment['transaction_date'] = formatISO(new Date(data.txnDateStr));

            if (data.adminStatus === 'accepted') {
                payment['status'] = OrderStatus.ORDER_PROCESSED;
            } else if (data.adminStatus === 'rejected') {
                payment['status'] = OrderStatus.ORDER_REJECTED;
            }

            // payment['foreign_id'] = data._id;
            payment.markModified('metadata');
            await payment.save();
        }

        return;
    }

    async updateCustomerStatus(data: {
        status: CustomerKycStatus;
        custId: string;
        email: string;
        pan: string;
        rejectRemarks: { type: string; remarks: string }[];
        userId: string;
        source: ConnectionType;
    }) {
        const statusRemarks = data.rejectRemarks.map((remark) => remark.remarks);
        const customer = await this.customerModel.getCustomerByForeignId(
            data.source,
            data.userId,
        );

        const account = await this.userCustomerModel.find({ customer_id: customer.id });

        const account_ids = account.map((item) => String(item.account_id));

        if (!customer) {
            // TODO - log the error
        }

        // Emitting the event tpt partner API
        this.eventEmitter.emit(
            'customer.status',
            new CustomerStatusEvent({
                customer_id: customer.id,
                account_ids: account_ids,
                status: data.status,
                remarks: statusRemarks,
            }),
        );

        customer.setConnectionValue(ConnectionType.ICM, 'kyc_id', data.custId.toString());
        customer.setConnectionValue(data.source, 'kyc_status', data.status);
        customer.set('remarks', statusRemarks);
        await customer.save();

        return;
    }

    async updateOrderStatus(data: { txnId?: string; orderId: string; status: OrderStatus }) {
        const order = await this.paymentModel.findOne({ order_id: data.orderId });

        if (!order) {
            // TODO - log the error
        }

        // Emitting the event tpt partner API
        this.eventEmitter.emit(
            'order.status',
            new OrderStatusEvent({
                order_id: order.id,
                status: data.status,
                account_id: String(order.account_id),
            }),
        );

        if (data.txnId) {
            order.set('transaction_id', data.txnId);
        }

        order.set('status', data.status);
        await order.save();

        return;
    }
}
