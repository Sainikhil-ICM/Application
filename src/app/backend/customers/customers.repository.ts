import {
    Account,
    AccountDocument,
    ConnectionType,
    Customer,
    CustomerDocument,
    User,
    UserCustomer,
    UserCustomerDocument,
    UserDocument,
} from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { Model, Types, Schema } from 'mongoose';
import { AkycErrorPanValidation, CustomerKycStatus } from 'src/constants/customer.const';
import { CustomerProfile, CustomerProfileDocument } from 'src/models/customer-profile.model';
import { GetCustomersDto } from './dto/get-customers.dto';
import { AbstractRepository } from 'src/database';
import { ProjectionType } from 'mongoose';

@Injectable()
export class CustomersRepository extends AbstractRepository<CustomerDocument> {
    protected readonly logger = new Logger(CustomersRepository.name);

    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
        @InjectModel(CustomerProfile.name)
        private customerProfileModel: Model<CustomerProfileDocument>,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
    ) {
        super(customerModel);
    }

    async getCustomer(customer_id: string) {
        return await this.customerModel.findById(customer_id);
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

    async findUser(
        filterQuery: FilterQuery<UserDocument>,
        projection?: ProjectionType<UserDocument>,
    ): Promise<UserDocument> {
        return (
            this.userModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async getCustomers(
        userCustomersQuery: FilterQuery<UserCustomer>,
        customersQuery: FilterQuery<Customer>,
        getCustomersDto: GetCustomersDto,
    ): Promise<any> {
        return this.userCustomerModel.aggregate([
            { $match: { ...userCustomersQuery } },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: '_id',
                    as: 'customer',
                    pipeline: [{ $match: { ...customersQuery } }],
                },
            },
            { $unwind: '$customer' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'customer_profiles',
                    localField: 'customer_id',
                    foreignField: 'customer_id',
                    as: 'customer_profile',
                },
            },
            {
                $unwind: {
                    path: '$customer_profile',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: '$customer._id',
                    customer: { $first: '$customer' },
                    advisor_name: { $first: { $first: '$user.name' } },
                    // kyc_mode: { $first: '$customer_profile.kyc_mode' },
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    email: '$customer.email',
                    name: '$customer.name',
                    pan_number: '$customer.pan_number',
                    phone_code: '$customer.phone_code',
                    phone_number: '$customer.phone_number',
                    connections: '$customer.connections',
                    is_consent_given: '$customer.is_consent_given',
                    onboard_date: '$customer.created_at',
                    advisor_name: '$advisor_name',
                    created_at: '$customer.created_at',
                    mandate_id: '$customer.mandate_id',
                    client_code: '$customer.client_code',
                    kyc_mode: '$customer.kyc_mode',
                },
            },
            {
                $facet: {
                    total: [{ $count: 'total_count' }],
                    collection: [
                        { $sort: { created_at: -1 } },
                        { $skip: (getCustomersDto.page - 1) * getCustomersDto.per_page },
                        { $limit: getCustomersDto.per_page },
                    ],
                },
            },
            {
                $project: {
                    collection: 1,
                    total_count: { $arrayElemAt: ['$total.total_count', 0] },
                },
            },
        ]);
    }

    async getCustomerProfile(customer_id: string) {
        return await this.customerProfileModel.findOne({
            customer_id: new Types.ObjectId(customer_id),
        });
    }

    async findCustomer(query: Partial<Customer>) {
        return await this.customerModel.findOne(query);
    }

    async findUserCustomer(
        filterQuery: FilterQuery<UserCustomerDocument>,
        projection?: ProjectionType<UserCustomerDocument>,
    ): Promise<UserCustomerDocument> {
        return (
            this.userCustomerModel
                // Keeping code in multiple lines.
                .findOne({ ...filterQuery }, projection)
                .lean({ virtuals: true })
        );
    }

    async updateUserCustomer(
        filterQuery: FilterQuery<UserCustomerDocument>,
        updateQuery: UpdateQuery<UserCustomerDocument>,
        options?: QueryOptions<UserCustomerDocument>,
    ): Promise<UserCustomerDocument> {
        return (
            this.userCustomerModel
                // Keeping code in multiple lines.
                .findOneAndUpdate(
                    { ...filterQuery },
                    { ...updateQuery },
                    { ...options, lean: { virtuals: true } },
                )
        );
    }

    async updateCustomerProfile(
        filterQuery: FilterQuery<CustomerProfileDocument>,
        updateQuery: UpdateQuery<CustomerProfileDocument>,
        options?: QueryOptions<CustomerProfileDocument>,
    ): Promise<CustomerProfileDocument> {
        return (
            this.customerProfileModel
                // Keeping code in multiple lines.
                .findOneAndUpdate(
                    { ...filterQuery },
                    { ...updateQuery },
                    { ...options, lean: { virtuals: true } },
                )
        );
    }

    async createCustomerProfile(customer_id: Types.ObjectId, body: Partial<CustomerProfile>) {
        return await this.customerProfileModel.findOneAndUpdate(
            {
                customer_id,
            },
            body,
            {
                new: true,
                upsert: true,
                background: true,
            },
        );
    }

    async updateKycFormAttachment(customer_id: Types.ObjectId, attachment_id: Types.ObjectId) {
        return await this.customerProfileModel.findOneAndUpdate(
            {
                customer_id,
            },
            {
                kyc_form_attachment_id: attachment_id,
            },
        );
    }

    async createAkycCustomerProfile(customerProfileData: Partial<CustomerProfile>) {
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

    async mapCustomerProfile(
        customerProfileId: Schema.Types.ObjectId,
        customerId: Schema.Types.ObjectId,
    ) {
        return await this.customerProfileModel.findOneAndUpdate(
            {
                _id: customerProfileId,
            },
            {
                $set: {
                    customer_id: customerId,
                },
            },
            {
                new: true,
            },
        );
    }

    async saveKycSignedForm(customer_id: string, signed_form_link: string) {
        const updatedCustomerProfile = await this.customerProfileModel.findOneAndUpdate(
            {
                customer_id: new Types.ObjectId(customer_id),
            },
            {
                $set: {
                    signed_form_link,
                },
            },
            {
                new: true,
            },
        );
        const customer = await this.customerModel.findById(customer_id);

        customer.setConnectionValue(
            ConnectionType.BIDD,
            'kyc_status',
            CustomerKycStatus.KYC_SUBMITTED,
        );
        await customer.save();

        return updatedCustomerProfile;
    }

    async updateCustomer(
        filterQuery: FilterQuery<CustomerDocument>,
        updateQuery: UpdateQuery<CustomerDocument>,
    ): Promise<CustomerDocument> {
        return (
            this.customerModel
                // Keeping code in multiple lines for better readability.
                .findOneAndUpdate({ ...filterQuery }, { ...updateQuery }, { new: true })
                .lean({ virtuals: true })
        );
    }
}
