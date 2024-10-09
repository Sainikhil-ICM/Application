import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Model,
    FilterQuery,
    QueryOptions,
    UpdateQuery,
    UpdateWriteOpResult,
    ObjectId,
    Types,
} from 'mongoose';
import { AkycErrorPanValidation } from 'src/constants/customer.const';

import {
    ConnectionType,
    Customer,
    CustomerDocument,
    CustomerStatics,
    TempCustomer,
    TempCustomerDocument,
    UserCustomer,
    UserCustomerDocument,
} from 'src/models';
import { CustomerProfile, CustomerProfileDocument } from 'src/models/customer-profile.model';

@Injectable()
export class CustomersRepository {
    protected readonly logger = new Logger(CustomersRepository.name);

    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument> & CustomerStatics,
        @InjectModel(TempCustomer.name)
        private tempCustomerModel: Model<TempCustomerDocument>,
        @InjectModel(CustomerProfile.name)
        private customerProfileModel: Model<CustomerProfileDocument>,
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
    ) {}

    async findCustomer(filterQuery: FilterQuery<Customer>): Promise<CustomerDocument> {
        return await this.customerModel.findOne(filterQuery).lean({ virtuals: true });
    }

    async findTempCustomer(
        filterQuery: FilterQuery<TempCustomer>,
        queryOptions?: QueryOptions<TempCustomer>,
    ): Promise<TempCustomerDocument> {
        return await this.tempCustomerModel
            .findOneAndUpdate(filterQuery, {}, queryOptions)
            .lean({ virtuals: true });
    }

    async createCustomer(createQuery: UpdateQuery<Customer>): Promise<CustomerDocument> {
        const customer = await this.customerModel.create({ ...createQuery });
        return customer.toJSON();
    }

    async updateCustomer(
        filterQuery: FilterQuery<Customer>,
        updateQuery: UpdateQuery<Customer>,
    ): Promise<UpdateWriteOpResult> {
        return this.customerModel
            .updateOne(filterQuery, { ...updateQuery })
            .lean({ virtuals: true });
    }

    async updateTempCustomer(
        filterQuery: FilterQuery<TempCustomer>,
        updateQuery: UpdateQuery<TempCustomer>,
    ): Promise<UpdateWriteOpResult> {
        return this.tempCustomerModel
            .updateOne(filterQuery, { ...updateQuery })
            .lean({ virtuals: true });
    }

    async deleteTempCustomer(
        filterQuery: FilterQuery<TempCustomer>,
    ): Promise<TempCustomerDocument> {
        return this.tempCustomerModel.deleteOne(filterQuery).lean({ virtuals: true });
    }

    async findUsersForCustomer(customerId: ObjectId): Promise<UserCustomerDocument[]> {
        return await this.userCustomerModel
            .find({ customer_id: customerId })
            .populate({ path: 'advisor', select: 'name' })
            .lean({ virtuals: true });
    }

    async findCustomerById(customerId: ObjectId): Promise<CustomerDocument> {
        return await this.customerModel.findById(customerId).lean({ virtuals: true });
    }

    async updateCustomerById(
        customerId: ObjectId,
        updates: UpdateQuery<CustomerDocument>,
        options?: QueryOptions<CustomerDocument>,
    ): Promise<CustomerDocument> {
        return this.customerModel.findByIdAndUpdate(
            customerId,
            { ...updates },
            { ...options, lean: { virtuals: true } },
        );
    }

    async findCustomerProfile(
        filterQuery: FilterQuery<CustomerProfileDocument>,
    ): Promise<CustomerProfileDocument> {
        return await this.customerProfileModel.findOne(filterQuery).lean({ virtuals: true });
    }

    async findCustomerByForeignId(
        type: ConnectionType,
        foreignId: string | Types.ObjectId,
    ): Promise<CustomerDocument> {
        return await this.customerModel.getCustomerByForeignId(type, foreignId);
    }

    async upsertCustomerProfile(customerId: ObjectId, updates: Partial<CustomerProfile>) {
        return await this.customerProfileModel
            .findOneAndUpdate({ customer_id: customerId }, updates, {
                new: true,
                upsert: true,
            })
            .lean({ virtuals: true });
    }

    async upsertKycCustomerProfile(customerProfileData: Partial<CustomerProfile>) {
        if (!customerProfileData.pan_number || !customerProfileData.transaction_id) {
            throw new Error('PAN Number & Transaction ID are required');
        }

        // step 1: check if the pan is already part of a completed profile; if so, reject the request
        const customerProfileExists = await this.customerProfileModel.exists({
            pan_number: customerProfileData.pan_number,
            all_details_filled: true,
        });

        if (customerProfileExists) throw new Error(AkycErrorPanValidation.PAN_EXISTS);

        // step 2: check if the pan is already part of an incomplete profile with a different transaction ID; if so, delete them
        // await this.customerProfileModel.deleteMany({
        //     pan_number: customerProfileData.pan_number,
        //     transaction_id: { $ne: customerProfileData.transaction_id },
        // });

        // step 3: check if the pan is already part of an incomplete profile with same transaction ID; if so, find one and update
        return await this.customerProfileModel.findOneAndUpdate(
            {
                pan_number: customerProfileData.pan_number,
                // transaction_id: customerProfileData.transaction_id,
            },
            {
                ...customerProfileData,
            },
            { upsert: true, background: true, new: true },
        );
    }
}
