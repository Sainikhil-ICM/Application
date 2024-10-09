import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Model,
    FilterQuery,
    UpdateQuery,
    UpdateWriteOpResult,
    ProjectionType,
    QueryOptions,
} from 'mongoose';

import {
    Account,
    AccountDocument,
    Customer,
    CustomerDocument,
    Payment,
    PaymentDocument,
    UserProduct,
    UserProductDocument,
} from 'src/models';

@Injectable()
export class MarketLinkedDebenturesRepository {
    protected readonly logger = new Logger(MarketLinkedDebenturesRepository.name);

    constructor(
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(UserProduct.name)
        private userProductModel: Model<UserProductDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
    ) {}

    async findCustomer(
        filterQuery: FilterQuery<CustomerDocument>,
        projection?: ProjectionType<CustomerDocument>,
    ): Promise<CustomerDocument> {
        return (
            this.customerModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async createPayment(createQuery: UpdateQuery<Payment>): Promise<PaymentDocument> {
        const payment = await this.paymentModel.create(createQuery);
        return payment.toJSON();
    }

    async findPayment(
        filterQuery: FilterQuery<PaymentDocument>,
        projection?: ProjectionType<PaymentDocument>,
    ): Promise<PaymentDocument> {
        return (
            this.paymentModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async updatePayment(
        filterQuery: FilterQuery<PaymentDocument>,
        updateQuery: UpdateQuery<PaymentDocument>,
        options?: QueryOptions<PaymentDocument>,
    ): Promise<PaymentDocument> {
        return (
            this.paymentModel
                // Keeping code in multiple lines.
                .findOneAndUpdate(
                    { ...filterQuery },
                    { ...updateQuery },
                    { ...options, lean: { virtuals: true } },
                )
        );
    }

    async findAccount(
        filterQuery: FilterQuery<AccountDocument>,
        projection?: ProjectionType<AccountDocument>,
    ): Promise<AccountDocument> {
        return (
            this.accountModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async findOneOrInsert(
        filterQuery: FilterQuery<UserProduct>,
        updateQuery: UpdateQuery<UserProduct>,
    ): Promise<UserProductDocument> {
        let userProduct = await this.userProductModel.findOne(filterQuery);
        debugger;
        if (!userProduct) {
            userProduct = await this.userProductModel.create({ ...filterQuery, ...updateQuery });
        }

        return userProduct.toJSON();
    }
}
