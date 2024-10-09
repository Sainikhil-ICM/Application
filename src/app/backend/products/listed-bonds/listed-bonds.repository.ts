import {
    Account,
    AccountDocument,
    Customer,
    CustomerDocument,
    Payment,
    PaymentDocument,
    User,
    UserDocument,
    UserProduct,
    UserProductDocument,
} from 'src/models';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { QueryOptions, Model, FilterQuery, UpdateQuery, ProjectionType } from 'mongoose';

@Injectable()
export class ListedBondsRepository {
    protected readonly logger = new Logger(ListedBondsRepository.name);

    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(UserProduct.name)
        private userProductModel: Model<UserProductDocument>,
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
    ) {}

    async findUserProduct(
        filterQuery: FilterQuery<UserProduct>,
        projection?: ProjectionType<UserProduct>,
    ): Promise<UserProductDocument> {
        return this.userProductModel.findOne(filterQuery, projection).lean({ virtuals: true });
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
}
