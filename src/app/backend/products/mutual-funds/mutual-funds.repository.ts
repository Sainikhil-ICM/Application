import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery, ProjectionType, QueryOptions } from 'mongoose';

import { Customer, CustomerDocument, Payment, PaymentDocument } from 'src/models';
import { CustomerProfile, CustomerProfileDocument } from 'src/models/customer-profile.model';

@Injectable()
export class MutualFundsRepository {
    protected readonly logger = new Logger(MutualFundsRepository.name);

    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerProfile.name)
        private customerProfileModel: Model<CustomerProfileDocument>,
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
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

    async updateCustomer(
        filterQuery: FilterQuery<CustomerDocument>,
        updateQuery: UpdateQuery<CustomerDocument>,
        options?: QueryOptions<CustomerDocument>,
    ): Promise<CustomerDocument> {
        return (
            this.customerModel
                // Keeping code in multiple lines.
                .findOneAndUpdate(
                    { ...filterQuery },
                    { ...updateQuery },
                    { ...options, lean: { virtuals: true } },
                )
        );
    }

    async createPayment(createQuery: UpdateQuery<PaymentDocument>): Promise<PaymentDocument> {
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
}
