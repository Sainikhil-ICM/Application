import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { ResProps1 } from 'types';
import { SessionUser } from 'src/constants/user.const';
import { Account, AccountDocument } from 'src/models/account.model';
import { Payment, PaymentDocument } from 'src/models/payment.model';
import { UserCustomer, UserCustomerDocument } from 'src/models/user-customer.model';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { OrderStatus } from 'src/constants/payment.const';
import { Customer, CustomerDocument } from 'src/models/customer.model';
import { UpdateAccountReqDto } from './dto/request/update-account.req.dto';
import { AccountProduct, AccountProductDocument } from 'src/models/account-product.model';
import { UserProduct, UserProductDocument } from 'src/models/user-product.model';
import { ProductType } from 'src/constants/product.const';
import { GetAccountUsersReqDto } from './dto/request/get-account-users.dto';
import { GetResourcesDto } from './dto/get-resources.dto';
import { AccountsRepository } from './accounts.repository';
import { ResourceStatus, ResourceType } from 'src/constants/resource.const';
import { Resource, User, UserDocument, UserLink, UserLinkDocument } from 'src/models';
import AttachmentService from 'src/services/attachment.service';
import { ResProps } from 'src/constants/constants';
import { AccessControlList } from 'src/constants/access-control.const';
import UtilityService from 'src/services/utility.service';

@Injectable()
export class AccountsService {
    constructor(
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(AccountProduct.name)
        private accountProductModel: Model<AccountProductDocument>,
        @InjectModel(UserProduct.name)
        private userProductModel: Model<UserProductDocument>,
        private readonly accountsRepository: AccountsRepository,
        @InjectModel(UserLink.name)
        private userLinkModel: Model<UserLinkDocument>,
        private readonly utilityService: UtilityService,
        private readonly attachmentService: AttachmentService,
    ) {}

    arrayIncludes = this.utilityService.arrayIncludes;

    aggregateMonthwiseCounts = async (
        model: Model<any>,
        dateField: string,
        account_id: ObjectId,
        startDate: Date,
        endDate: Date,
        additionalMatch?: Record<string, any>, // Additional conditions to match
    ): Promise<{ month: number; count: number; totalAmount?: number }[]> => {
        const matchConditions = {
            account_id: account_id,
            [dateField]: {
                $gte: startDate,
                $lte: endDate,
            },
            ...(additionalMatch || {}), // Merge additional match conditions if provided
        };

        return model
            .aggregate([
                {
                    $match: matchConditions,
                },
                {
                    $group: {
                        _id: { $month: `$${dateField}` },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$user_amount' }, // Add this stage for sum of user_amount
                    },
                },
                {
                    $project: {
                        month: '$_id',
                        count: 1,
                        totalAmount: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: {
                        month: 1,
                    },
                },
            ])
            .exec();
    };

    async getAccount(session: SessionUser): Promise<ResProps1<Account>> {
        const account = await this.accountModel
            .findOne({ _id: session.account_id })
            .select('logo name type code code_prefix api_token');

        if (!account) {
            return {
                success: false,
                message: 'Account not found.',
            };
        }

        return { success: true, data: account };
    }

    async getAccountCommission(session: SessionUser): Promise<ResProps1<any>> {
        try {
            const transactions = await this.paymentModel.find({
                account_id: session.account_id,
                status: OrderStatus.ORDER_PROCESSED,
            });
            let totalCommission = 0;

            await Promise.all(
                transactions.map(async (item: Payment) => {
                    const accountMaxXirr = await this.accountProductModel.findOne({
                        product_isin: item.product_isin,
                        account_id: item.account_id,
                    });

                    let xirr = 0;

                    if (item.product_type === ProductType.MLD) {
                        xirr = 2;
                    } else {
                        xirr =
                            (accountMaxXirr?.max_return_rate || 0.005) -
                            (item?.return_rate || 0.005);
                    }

                    const commission = item.user_amount * (xirr / 100);
                    totalCommission += commission;
                }),
            );

            return {
                success: true,
                data: totalCommission,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Something went wrong',
            };
        }
    }

    async getMyCommssion(session: SessionUser): Promise<ResProps1<any>> {
        try {
            const transactions = await this.paymentModel.find({
                account_id: session.account_id,
                status: OrderStatus.ORDER_PROCESSED,
            });

            let totalCommission = 0;
            await Promise.all(
                transactions.map(async (item: Payment) => {
                    const accountMaxXirr = await this.accountProductModel.findOne({
                        product_isin: item.product_isin,
                        account_id: item.account_id,
                    });
                    const userMaxXirr = await this.userProductModel.findOne({
                        product_isin: item.product_isin,
                        user_id: item.advisor_id,
                    });
                    let xirr = 0.005;
                    if (accountMaxXirr.max_return_rate > userMaxXirr.max_return_rate) {
                        xirr = accountMaxXirr.max_return_rate - userMaxXirr.max_return_rate;
                    }

                    const commission = item.user_amount * (xirr / 100);
                    totalCommission += commission;
                }),
            );

            return {
                success: true,
                data: totalCommission,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Something went wrong',
            };
        }
    }

    async getAccountOverview(
        session: SessionUser,
        start_date?: string,
        end_date?: string,
    ): Promise<ResProps1<any>> {
        const customerIds = await this.userCustomerModel.distinct('customer_id', {
            account_id: session.account_id,
        });

        const startDate = new Date(start_date) ?? new Date('2023-01-01');
        const endDate = new Date(end_date) ?? new Date('2024-01-01'); // Set endDate to the current date

        const [
            total_advisors,
            total_customers,
            active_customers,
            total_trxns,
            pending_trxns,
            asset_holdings,
            aumBreakUp,
            monthwiseTransactionCounts,
            monthwiseCustomerCounts,
            monthwiseAdvisorCounts,
        ] = await Promise.all([
            this.userModel.countDocuments({ account_id: session.account_id }),
            this.userCustomerModel.countDocuments({ account_id: session.account_id }),
            this.customerModel.countDocuments({
                _id: { $in: customerIds },
                'connections.status': CustomerKycStatus.KYC_VERIFIED,
            }),
            this.paymentModel.countDocuments({ account_id: session.account_id }),
            this.paymentModel.countDocuments({
                account_id: session.account_id,
                status: {
                    $in: [
                        OrderStatus.ORDER_PENDING,
                        OrderStatus.ORDER_PREBOOKED,
                        OrderStatus.ORDER_INITIATED,
                        OrderStatus.PAYMENT_LINK_SENT,
                        OrderStatus.PAYMENT_LINK_OPENED,
                        OrderStatus.DIGIO_DOC_OPENED,
                        OrderStatus.DIGIO_DOC_SENT,
                        OrderStatus.DIGIO_SIGN_SUCCESS,
                    ],
                },
            }),
            this.paymentModel.aggregate([
                {
                    $match: {
                        account_id: session.account_id,
                        status: OrderStatus.ORDER_PROCESSED,
                    },
                },
                {
                    $group: {
                        _id: null,
                        successful_trxns: { $sum: 1 },
                        total_trxn_value: { $sum: '$user_amount' },
                        avg_trxn_value: { $avg: '$user_amount' },
                    },
                },
            ]),
            this.paymentModel
                .aggregate([
                    {
                        $match: {
                            account_id: session.account_id,
                            product_type: {
                                $in: [
                                    ProductType.MLD,
                                    ProductType.BOND,
                                    ProductType.IPO,
                                    ProductType.MUTUAL_FUND,
                                    ProductType.UNLISTED_EQUITY,
                                ],
                            },

                            status: OrderStatus.ORDER_PROCESSED,
                        },
                    },
                    {
                        $group: {
                            _id: '$product_type',
                            totalUserAmount: { $sum: '$user_amount' },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            product_type: '$_id',
                            totalUserAmount: 1,
                        },
                    },
                ])
                .exec(),

            this.aggregateMonthwiseCounts(
                this.paymentModel,
                'created_at',
                session.account_id,
                startDate,
                endDate,
                { status: OrderStatus.ORDER_PROCESSED },
            ),
            this.aggregateMonthwiseCounts(
                this.userCustomerModel,
                'created_at',
                session.account_id,
                startDate,
                endDate,
            ),
            this.aggregateMonthwiseCounts(
                this.userModel,
                'created_at',
                session.account_id,
                startDate,
                endDate,
            ),
        ]);

        console.log(
            '🚀 ~ file: accounts.service.ts:48 ~ AccountsService ~ getAccountOverview ~ totalCustomers:',
            JSON.stringify(
                {
                    total_customers,
                    active_customers,
                    total_trxns,
                    pending_trxns,
                    ...asset_holdings.at(0),
                },
                null,
                2,
            ),
        );

        return {
            success: true,
            data: {
                total_advisors,
                total_customers,
                active_customers,
                total_trxns,
                pending_trxns,
                aumBreakUp,
                monthwiseTransactionCounts,
                monthwiseCustomerCounts,
                monthwiseAdvisorCounts,
                ...asset_holdings.at(0),
            },
        };
    }

    async getUsers(session: SessionUser, query: GetAccountUsersReqDto): Promise<ResProps1<any>> {
        const startDate = query.start_date ? new Date(query.start_date) : new Date('2023-01-01');
        const endDate = query.end_date ? new Date(query.end_date) : new Date();
        const searchParams = {};
        const accessControlList = [
            AccessControlList.LIST_ACCOUNT_USERS,
            AccessControlList.LIST_MANAGED_USERS,
        ];

        if (!this.arrayIncludes(accessControlList, session.roles)) {
            return {
                success: false,
                message: 'You do not have access to this resource.',
            };
        }

        if (session.roles.includes(AccessControlList.LIST_ACCOUNT_USERS)) {
            searchParams['account_id'] = session.account_id;
        } else if (session.roles.includes(AccessControlList.LIST_MANAGED_USERS) && query.user_id) {
            searchParams['account_id'] = session.account_id;

            const reporteeIds = await this
                // Commenting helps keep this code in multiple lines.
                .getReporteeIds([String(session.user_id)])
                .then((ids) => ids.map((id) => new Types.ObjectId(id)));

            searchParams['_id'] = { $in: reporteeIds };
        }

        const [res] = await this.userModel.aggregate([
            {
                $match: {
                    account_id: session.account_id,
                    created_at: { $gte: startDate, $lte: endDate },
                    ...searchParams,
                },
            },
            {
                $facet: {
                    total: [
                        {
                            $count: 'total',
                        },
                    ],
                    data: [
                        {
                            $lookup: {
                                from: 'user_customers',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'customers',
                                pipeline: [
                                    {
                                        $match: {
                                            created_at: { $gte: startDate, $lte: endDate },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: 'payments',
                                localField: '_id',
                                foreignField: 'advisor_id',
                                as: 'payments',
                                pipeline: [
                                    {
                                        $match: {
                                            status: OrderStatus.ORDER_PROCESSED,
                                            created_at: { $gte: startDate, $lte: endDate },
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                total_customers: { $size: '$customers' },
                                total_transactions: { $size: '$payments' },
                                advisor_name: '$name',
                                total_holdings: { $sum: '$payments.user_amount' },
                            },
                        },
                        {
                            $project: {
                                advisor_name: 1,
                                total_customers: 1,
                                total_transactions: 1,
                                total_holdings: 1,
                            },
                        },
                        { $skip: (query.page - 1) * query.per_page },
                        { $limit: query.per_page },
                    ],
                },
            },
            {
                $project: {
                    data: 1,
                    total_count: { $first: '$total.total' },
                },
            },
        ]);

        console.log('🚀 ~ file: accounts.service.ts:146 ~ AccountsService ~ getUsers ~ res:', res);
        const { data, total_count } = res;

        return {
            success: true,
            data: {
                collection: data,
                page: query.page,
                per_page: query.per_page,
                total_count: total_count,
            },
        };
    }

    private async getReporteeIds(
        managerIds: string[],
        memo: string[] = [],
        retries = 5,
    ): Promise<string[]> {
        const userIds = [...new Set([...memo, ...managerIds])];
        const reporteeIds = await this.userLinkModel
            .distinct('reportee_id', { manager_id: { $in: managerIds } })
            .then((ids) => ids.map((id) => String(id)));

        // Adding retries to avoid infinite loop.
        if (reporteeIds.length && retries > 0) {
            return await this.getReporteeIds(reporteeIds, userIds, retries - 1);
        }

        return userIds;
    }

    async updateAccount(
        session: SessionUser,
        body: UpdateAccountReqDto,
    ): Promise<ResProps1<Account>> {
        const account = await this.accountModel
            .findOne({ _id: session.account_id })
            .select('id name');

        if (!account) {
            return {
                success: false,
                message: 'Account not found.',
            };
        }

        account.set('name', body.name);
        await account.save();

        return { success: true, data: account };
    }

    async getResources(account_id: string, getResourcesDto: GetResourcesDto): Promise<ResProps> {
        const resourcesQuery = {};

        resourcesQuery['account_id'] = new Types.ObjectId(account_id);
        resourcesQuery['status'] = ResourceStatus.ACTIVE;

        if (getResourcesDto.name) {
            resourcesQuery['name'] = { $regex: new RegExp(getResourcesDto.name, 'i') };
        }

        if (getResourcesDto.category) {
            resourcesQuery['category'] = getResourcesDto.category;
        }

        if (getResourcesDto.sub_category) {
            resourcesQuery['sub_category'] = getResourcesDto.sub_category;
        }

        const resourcesResult = await this.accountsRepository.getResources(
            resourcesQuery,
            { per_page: getResourcesDto.per_page, page: getResourcesDto.page },
            ['_RELATIONSHIP_ADVISOR'],
        );

        const total = resourcesResult.total;
        const resources = resourcesResult.docs as Resource[];

        for (const resource of resources) {
            if (resource.type === ResourceType.DOCUMENT) {
                try {
                    const attachment = await this.attachmentService.getAttachment(
                        resource.attachment_id,
                    );
                    resource.link = attachment.location;
                } catch (error) {
                    console.error('Failed to fetch resource attachment', error);
                }
            }
        }

        if (resources.length === 0) {
            return {
                success: false,
                message: 'No Resources Found',
            };
        }

        return {
            success: true,
            data: {
                collection: resources,
                total_count: total,
                per_page: getResourcesDto.per_page,
                page: getResourcesDto.page,
            },
        };
    }
}
