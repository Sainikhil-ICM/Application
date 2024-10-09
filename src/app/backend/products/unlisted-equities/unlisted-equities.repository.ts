import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery, ProjectionType } from 'mongoose';

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
export class UnlistedEquitiesRepository {
    protected readonly logger = new Logger(UnlistedEquitiesRepository.name);

    constructor(
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(UserProduct.name)
        private userProductModel: Model<UserProductDocument>,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
    ) {}

    async createPayment(updateQuery: UpdateQuery<Payment>): Promise<PaymentDocument> {
        const payment = await this.paymentModel.create(updateQuery);
        return payment.toJSON();
    }

    async findPayment(
        filterQuery: FilterQuery<Payment>,
        projection?: ProjectionType<Payment>,
    ): Promise<PaymentDocument> {
        return this.paymentModel.findOne({ ...filterQuery }, projection).lean({ virtuals: true });
    }

    async updatePayment(
        filterQuery: FilterQuery<Payment>,
        updateQuery: UpdateQuery<Payment>,
    ): Promise<PaymentDocument> {
        return (
            this.paymentModel
                // Keeping code in multiple lines for better readability.
                .findOneAndUpdate({ ...filterQuery }, { ...updateQuery }, { new: true })
                .lean({ virtuals: true })
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

    async findOneOrInsert(
        filterQuery: FilterQuery<UserProduct>,
        updateQuery: UpdateQuery<UserProduct>,
    ): Promise<UserProductDocument> {
        let userProduct = await this.userProductModel.findOne(filterQuery);

        if (!userProduct) {
            userProduct = await this.userProductModel.create({ ...filterQuery, ...updateQuery });
        }

        return userProduct.toJSON();
    }
}
