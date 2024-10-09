import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument, UserCustomer, UserCustomerDocument } from 'src/models';
import { ReadPreference } from 'mongodb';

@Injectable()
export class AnalyticsRepository {
    protected readonly logger = new Logger(AnalyticsRepository.name);

    constructor(
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
    ) {}

    async getIfaDashboardAumPerMonth(advisor_id: string, start_date: string, end_date: string) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                    },
                },
                {
                    // Project the necessary fields: year, month, product_type, and user_amount
                    $project: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        product_type: 1,
                        user_amount: 1,
                    },
                },
                {
                    // Group by year, month, and product_type to calculate the summation per month
                    $group: {
                        _id: {
                            year: '$year',
                            month: '$month',
                            product_type: '$product_type',
                        },
                        total_user_amount: { $sum: '$user_amount' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.year',
                        month: '$_id.month',
                        product_type: '$_id.product_type',
                        total_user_amount: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by year and month in ascending order
                    $sort: {
                        year: 1,
                        month: 1,
                        product_type: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = {};
        for (const payment of paymentsData) {
            const productType = payment.product_type;
            const dateKey = payment.year + '-' + payment.month;

            if (productType in mappedPaymentsData) {
                mappedPaymentsData[productType][dateKey] = payment.total_user_amount;
            } else {
                mappedPaymentsData[productType] = {
                    [dateKey]: payment.total_user_amount,
                };
            }
        }
        const productTypes = Object.keys(mappedPaymentsData);

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear() + '-' + (dateIterator.getMonth() + 1);

            for (const productType of productTypes) {
                if (!(dateKey in mappedPaymentsData[productType])) {
                    mappedPaymentsData[productType][dateKey] = 0;
                }
            }

            dateIterator.setMonth(dateIterator.getMonth() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardAumPerFiscalYear(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                    },
                },
                {
                    // Project the financial year and adjusted month
                    $project: {
                        fiscal_year: {
                            $cond: [
                                { $gte: [{ $month: '$created_at' }, 4] }, // If month >= April
                                { $year: '$created_at' }, // Keep the same year
                                { $subtract: [{ $year: '$created_at' }, 1] }, // Else use the previous year
                            ],
                        },
                        product_type: 1,
                        user_amount: 1,
                    },
                },
                {
                    // Group by fiscal year, fiscal month, and product_type
                    $group: {
                        _id: {
                            fiscal_year: '$fiscal_year',
                            product_type: '$product_type',
                        },
                        total_user_amount: { $sum: '$user_amount' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.fiscal_year',
                        product_type: '$_id.product_type',
                        total_user_amount: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by fiscal year and fiscal month in ascending order
                    $sort: {
                        year: 1,
                        product_type: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = {};
        for (const payment of paymentsData) {
            const productType = payment.product_type;
            const dateKey = payment.year.toString();

            if (productType in mappedPaymentsData) {
                mappedPaymentsData[productType][dateKey] = payment.total_user_amount;
            } else {
                mappedPaymentsData[productType] = {
                    [dateKey]: payment.total_user_amount,
                };
            }
        }
        const productTypes = Object.keys(mappedPaymentsData);

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear().toString();

            for (const productType of productTypes) {
                if (!(dateKey in mappedPaymentsData[productType])) {
                    mappedPaymentsData[productType][dateKey] = 0;
                }
            }

            dateIterator.setFullYear(dateIterator.getFullYear() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardGrossSalesPerMonth(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                        type: 'purchase',
                        product_type: 'MUTUAL_FUND',
                    },
                },
                {
                    // Project the necessary fields: year, month, product_type, and user_amount
                    $project: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        units: 1,
                    },
                },
                {
                    // Group by year, month, and product_type to calculate the summation per month
                    $group: {
                        _id: {
                            year: '$year',
                            month: '$month',
                        },
                        total_units: { $sum: '$units' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.year',
                        month: '$_id.month',
                        total_units: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by year and month in ascending order
                    $sort: {
                        year: 1,
                        month: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = {};
        for (const payment of paymentsData) {
            const dateKey = payment.year + '-' + payment.month;

            mappedPaymentsData[dateKey] = payment.total_units;
        }

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear() + '-' + (dateIterator.getMonth() + 1);

            if (!(dateKey in mappedPaymentsData)) {
                mappedPaymentsData[dateKey] = 0;
            }

            dateIterator.setMonth(dateIterator.getMonth() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardGrossSalesPerFiscalYear(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                        type: 'purchase',
                        product_type: 'MUTUAL_FUND',
                    },
                },
                {
                    // Project the financial year and adjusted month
                    $project: {
                        fiscal_year: {
                            $cond: [
                                { $gte: [{ $month: '$created_at' }, 4] }, // If month >= April
                                { $year: '$created_at' }, // Keep the same year
                                { $subtract: [{ $year: '$created_at' }, 1] }, // Else use the previous year
                            ],
                        },
                        units: 1,
                    },
                },
                {
                    // Group by fiscal year, fiscal month, and product_type
                    $group: {
                        _id: {
                            fiscal_year: '$fiscal_year',
                        },
                        total_units: { $sum: '$units' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.fiscal_year',
                        total_units: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by fiscal year and fiscal month in ascending order
                    $sort: {
                        year: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = {};
        for (const payment of paymentsData) {
            const dateKey = payment.year.toString();

            mappedPaymentsData[dateKey] = payment.total_units;
        }

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear().toString();

            if (!(dateKey in mappedPaymentsData)) {
                mappedPaymentsData[dateKey] = 0;
            }

            dateIterator.setFullYear(dateIterator.getFullYear() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardNetSalesPerMonth(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                        product_type: 'MUTUAL_FUND',
                        type: {
                            $in: ['redeem', 'purchase'],
                        },
                    },
                },
                {
                    // Project the necessary fields: year, month, product_type, and user_amount
                    $project: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        units: {
                            $cond: {
                                if: { $eq: ['$type', 'redeem'] }, // If type is "redeem"
                                then: { $multiply: ['$units', -1] }, // Negate the units
                                else: '$units', // Otherwise, keep the original units
                            },
                        },
                    },
                },
                {
                    // Group by year, month, and product_type to calculate the summation per month
                    $group: {
                        _id: {
                            year: '$year',
                            month: '$month',
                        },
                        total_units: { $sum: '$units' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.year',
                        month: '$_id.month',
                        total_units: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by year and month in ascending order
                    $sort: {
                        year: 1,
                        month: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = {};
        for (const payment of paymentsData) {
            const dateKey = payment.year + '-' + payment.month;

            mappedPaymentsData[dateKey] = payment.total_units;
        }

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear() + '-' + (dateIterator.getMonth() + 1);

            if (!(dateKey in mappedPaymentsData)) {
                mappedPaymentsData[dateKey] = 0;
            }

            dateIterator.setMonth(dateIterator.getMonth() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardNetSalesPerFiscalYear(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                        type: {
                            $in: ['redeem', 'purchase'],
                        },
                    },
                },
                {
                    // Project the financial year and adjusted month
                    $project: {
                        fiscal_year: {
                            $cond: [
                                { $gte: [{ $month: '$created_at' }, 4] }, // If month >= April
                                { $year: '$created_at' }, // Keep the same year
                                { $subtract: [{ $year: '$created_at' }, 1] }, // Else use the previous year
                            ],
                        },
                        product_type: 1,
                        units: {
                            $cond: {
                                if: { $eq: ['$type', 'redeem'] }, // If type is "redeem"
                                then: { $multiply: ['$units', -1] }, // Negate the units
                                else: '$units', // Otherwise, keep the original units
                            },
                        },
                    },
                },
                {
                    // Group by fiscal year, fiscal month, and product_type
                    $group: {
                        _id: {
                            fiscal_year: '$fiscal_year',
                            product_type: '$product_type',
                        },
                        total_units: { $sum: '$units' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.fiscal_year',
                        product_type: '$_id.product_type',
                        total_units: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by fiscal year and fiscal month in ascending order
                    $sort: {
                        year: 1,
                        product_type: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = {};
        for (const payment of paymentsData) {
            const productType = payment.product_type;
            const dateKey = payment.year.toString();

            if (productType in mappedPaymentsData) {
                mappedPaymentsData[productType][dateKey] = payment.total_units;
            } else {
                mappedPaymentsData[productType] = {
                    [dateKey]: payment.total_units,
                };
            }
        }
        const productTypes = Object.keys(mappedPaymentsData);

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear().toString();

            for (const productType of productTypes) {
                if (!(dateKey in mappedPaymentsData[productType])) {
                    mappedPaymentsData[productType][dateKey] = 0;
                }
            }

            dateIterator.setFullYear(dateIterator.getFullYear() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardSipPerMonth(advisor_id: string, start_date: string, end_date: string) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                        payment_schedule: 'RECURRING',
                        type: 'purchase',
                    },
                },
                {
                    // Project the necessary fields: year, month, product_type, and user_amount
                    $project: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                    },
                },
                {
                    // Group by year, month, and product_type to calculate the summation per month
                    $group: {
                        _id: {
                            year: '$year',
                            month: '$month',
                        },
                        total_sips: { $sum: 1 },
                        total_value: { $sum: '$user_amount' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.year',
                        month: '$_id.month',
                        total_sips: 1,
                        total_value: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by year and month in ascending order
                    $sort: {
                        year: 1,
                        month: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = { counts: {}, values: {} };
        for (const payment of paymentsData) {
            const dateKey = payment.year + '-' + payment.month;
            mappedPaymentsData['counts'][dateKey] = payment.total_sips;
            mappedPaymentsData['values'][dateKey] = payment.total_value;
        }

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear() + '-' + (dateIterator.getMonth() + 1);

            if (!(dateKey in mappedPaymentsData['counts'])) {
                mappedPaymentsData['counts'][dateKey] = 0;
            }
            if (!(dateKey in mappedPaymentsData['values'])) {
                mappedPaymentsData['values'][dateKey] = 0;
            }

            dateIterator.setMonth(dateIterator.getMonth() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardSipPerFiscalYear(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const paymentsData = await this.paymentModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        advisor_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                        payment_schedule: 'RECURRING',
                        type: 'purchase',
                    },
                },
                {
                    // Project the financial year and adjusted month
                    $project: {
                        fiscal_year: {
                            $cond: [
                                { $gte: [{ $month: '$created_at' }, 4] }, // If month >= April
                                { $year: '$created_at' }, // Keep the same year
                                { $subtract: [{ $year: '$created_at' }, 1] }, // Else use the previous year
                            ],
                        },
                    },
                },
                {
                    // Group by fiscal year, fiscal month, and product_type
                    $group: {
                        _id: {
                            fiscal_year: '$fiscal_year',
                        },
                        total_sips: { $sum: 1 },
                        total_value: { $sum: '$user_amount' },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.fiscal_year',
                        total_sips: 1,
                        total_value: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by fiscal year and fiscal month in ascending order
                    $sort: {
                        year: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedPaymentsData = { counts: {}, values: {} };
        for (const payment of paymentsData) {
            const dateKey = payment.year.toString();
            mappedPaymentsData['counts'][dateKey] = payment.total_sips;
            mappedPaymentsData['values'][dateKey] = payment.total_value;
        }

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear().toString();

            if (!(dateKey in mappedPaymentsData['counts'])) {
                mappedPaymentsData['counts'][dateKey] = 0;
            }
            if (!(dateKey in mappedPaymentsData['values'])) {
                mappedPaymentsData['values'][dateKey] = 0;
            }

            dateIterator.setFullYear(dateIterator.getFullYear() + 1);
        }

        return mappedPaymentsData;
    }

    async getIfaDashboardCustomersPerMonth(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const newCustomersData = await this.userCustomerModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        user_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                    },
                },
                {
                    // Project the necessary fields: year, month, product_type, and user_amount
                    $project: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                    },
                },
                {
                    // Group by year, month, and product_type to calculate the summation per month
                    $group: {
                        _id: {
                            year: '$year',
                            month: '$month',
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.year',
                        month: '$_id.month',
                        count: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by year and month in ascending order
                    $sort: {
                        year: 1,
                        month: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedCustomersData = { new: {}, total: {} };
        for (const customer of newCustomersData) {
            const dateKey = customer.year + '-' + customer.month;
            mappedCustomersData['new'][dateKey] = customer.count;
        }
        for (const customer of newCustomersData) {
            // TODO: figure out logic to return count of
            // all customers till date
            const dateKey = customer.year + '-' + customer.month;
            mappedCustomersData['total'][dateKey] = customer.count;
        }

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear() + '-' + (dateIterator.getMonth() + 1);

            if (!(dateKey in mappedCustomersData['new'])) {
                mappedCustomersData['new'][dateKey] = 0;
            }
            if (!(dateKey in mappedCustomersData['total'])) {
                mappedCustomersData['total'][dateKey] = 0;
            }

            dateIterator.setMonth(dateIterator.getMonth() + 1);
        }

        return mappedCustomersData;
    }

    async getIfaDashboardCustomersPerFiscalYear(
        advisor_id: string,
        start_date: string,
        end_date: string,
    ) {
        const newCustomersData = await this.userCustomerModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        user_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                    },
                },
                {
                    // Project the financial year and adjusted month
                    $project: {
                        fiscal_year: {
                            $cond: [
                                { $gte: [{ $month: '$created_at' }, 4] }, // If month >= April
                                { $year: '$created_at' }, // Keep the same year
                                { $subtract: [{ $year: '$created_at' }, 1] }, // Else use the previous year
                            ],
                        },
                    },
                },
                {
                    // Group by fiscal year, fiscal month, and product_type
                    $group: {
                        _id: {
                            fiscal_year: '$fiscal_year',
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.fiscal_year',
                        count: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by fiscal year and fiscal month in ascending order
                    $sort: {
                        year: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );
        const allCustomersData = await this.userCustomerModel.aggregate(
            [
                {
                    // Filter documents within the start and end date range
                    $match: {
                        user_id: new Types.ObjectId(advisor_id),
                        created_at: {
                            $gte: new Date(start_date),
                            $lte: new Date(end_date),
                        },
                    },
                },
                {
                    // Project the financial year and adjusted month
                    $project: {
                        fiscal_year: {
                            $cond: [
                                { $gte: [{ $month: '$created_at' }, 4] }, // If month >= April
                                { $year: '$created_at' }, // Keep the same year
                                { $subtract: [{ $year: '$created_at' }, 1] }, // Else use the previous year
                            ],
                        },
                    },
                },
                {
                    // Group by fiscal year, fiscal month, and product_type
                    $group: {
                        _id: {
                            fiscal_year: '$fiscal_year',
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    // Project the fields from _id to be top-level fields
                    $project: {
                        year: '$_id.fiscal_year',
                        count: 1,
                        _id: 0,
                    },
                },
                {
                    // Sort by fiscal year and fiscal month in ascending order
                    $sort: {
                        year: 1,
                    },
                },
            ],
            {
                readPreference: ReadPreference.SECONDARY,
            },
        );

        const mappedCustomersData = { new: {}, total: {} };
        for (const customer of newCustomersData) {
            const dateKey = customer.year.toString();
            mappedCustomersData['new'][dateKey] = customer.count;
        }
        for (const customer of allCustomersData) {
            const dateKey = customer.year.toString();
            mappedCustomersData['total'][dateKey] = customer.count;
        }

        const dateIterator = new Date(start_date);
        const endDate = new Date(end_date);

        while (dateIterator < endDate) {
            const dateKey = dateIterator.getFullYear().toString();

            if (!(dateKey in mappedCustomersData['new'])) {
                mappedCustomersData['new'][dateKey] = 0;
            }
            if (!(dateKey in mappedCustomersData['total'])) {
                mappedCustomersData['total'][dateKey] = 0;
            }

            dateIterator.setFullYear(dateIterator.getFullYear() + 1);
        }

        return mappedCustomersData;
    }
}
