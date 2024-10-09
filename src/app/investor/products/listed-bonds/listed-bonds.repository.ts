import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';

import {
    Customer,
    CustomerDocument,
    Payment,
    PaymentDocument,
    User,
    UserDocument,
    Account,
    AccountDocument,
} from 'src/models';

@Injectable()
export class ListedBondsRepository {
    protected readonly logger = new Logger(ListedBondsRepository.name);

    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        @InjectModel(Payment.name)
        private readonly paymentModel: Model<PaymentDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async findCustomer(
        filterQuery: FilterQuery<Customer>,
        projection?: ProjectionType<Customer>,
    ): Promise<CustomerDocument> {
        return (
            this.customerModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async findUser(
        filterQuery: FilterQuery<User>,
        projection?: ProjectionType<User>,
    ): Promise<UserDocument> {
        return (
            this.userModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async findAccount(
        filterQuery: FilterQuery<Account>,
        projection?: ProjectionType<Account>,
    ): Promise<AccountDocument> {
        return (
            this.accountModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async createPayment(createQuery: UpdateQuery<Payment>): Promise<PaymentDocument> {
        const payment = await this.paymentModel.create(createQuery);
        return payment.toJSON();
    }

    async updatePayment(
        filterQuery: FilterQuery<Payment>,
        updateQuery: UpdateQuery<Payment>,
        options?: QueryOptions<Payment>,
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
}
