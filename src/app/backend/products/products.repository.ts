import { Model } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { Customer, UserCustomer, UserCustomerDocument } from 'src/models';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CustomerKycStatus } from 'src/constants/customer.const';

@Injectable()
export class ProductsRepository {
    protected readonly logger = new Logger(ProductsRepository.name);

    constructor(
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
    ) {}

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
                    pipeline: [
                        {
                            $match: {
                                pan_number: { $exists: true },
                                ...customersQuery,
                            },
                        },
                    ],
                },
            },
            { $unwind: '$customer' },
            {
                $group: {
                    _id: '$customer._id',
                    customer: { $first: '$customer' },
                },
            },
            {
                $replaceRoot: {
                    newRoot: '$customer',
                },
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    email: 1,
                    name: 1,
                    pan_number: 1,
                    phone_code: 1,
                    phone_number: 1,
                    mandate_id: 1,
                    client_code: 1,
                },
            },
            {
                $facet: {
                    total: [{ $count: 'total_count' }],
                    collection: [
                        { $sort: { name: 1 } },
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
}
