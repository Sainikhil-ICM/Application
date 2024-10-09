import { Queue } from 'bull';
import { ResProps1 } from 'types';
import * as uniq from 'lodash/uniq';
import { JwtService } from '@nestjs/jwt';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { User, UserDocument } from 'src/models/user.model';
import { BankAccount } from 'src/models/bank-account.model';
import { Account, AccountDocument } from 'src/models/account.model';
import { Payment, PaymentDocument } from 'src/models/payment.model';
import { Customer, CustomerDocument } from 'src/models/customer.model';
import { UserLink, UserLinkDocument } from 'src/models/user-link.model';
import { RoleGroup, RoleGroupDocument } from 'src/models/role-group.model';
import { UserProduct, UserProductDocument } from 'src/models/user-product.model';
import { UserCustomer, UserCustomerDocument } from 'src/models/user-customer.model';

import { ProductType } from 'src/constants/product.const';
import { OrderStatus } from 'src/constants/payment.const';
import { JobName, QueueName, ResProps } from 'src/constants/constants';
import { SessionUser, UserRole, UserStatus } from 'src/constants/user.const';
import { AccessControlList, InvitationSource } from 'src/constants/access-control.const';

import { UsersRepository } from './users.repository';
import BondsService from 'src/services/bonds.service';
import UtilityService from 'src/services/utility.service';
import UserLogService from 'src/services/user-log/user-log.service';
import MutualFundService from 'src/services/mutual-fund/mutual-fund.service';

import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUsersDto } from './dto/create-users.dto';
import { GetUserLinksDto } from './dto/get-user-links.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { GetUserReportDto } from './dto/get-user-report.dto';
import { CreateUserLinksDto } from './dto/create-user-links.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { UpdateAccessControlsDto } from './dto/update-access-controls.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(BankAccount.name)
        private bankAccountModel: Model<BankAccount>,
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(Payment.name)
        private paymentModel: Model<PaymentDocument>,
        @InjectModel(UserProduct.name)
        private userProductModel: Model<UserProductDocument>,
        @InjectModel(UserLink.name)
        private userLinkModel: Model<UserLinkDocument>,
        @InjectModel(RoleGroup.name)
        private roleGroupModel: Model<RoleGroupDocument>,
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,

        @InjectQueue(QueueName.PRODUCTS_QUEUE)
        private productsQueue: Queue,

        private readonly usersRepository: UsersRepository,
        private readonly userLogService: UserLogService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly utilityService: UtilityService,
        private readonly bondsService: BondsService,
        private readonly eventEmitter: EventEmitter2,
        private readonly mutualFundService: MutualFundService,
    ) {}

    arrayIncludes = this.utilityService.arrayIncludes;

    aggregateMonthwiseCounts = async (
        model: Model<any>,
        dateField: string,
    ): Promise<{ month: number; count: number }[]> => {
        return model
            .aggregate([
                {
                    $group: {
                        _id: { $month: `$${dateField}` },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        month: '$_id',
                        count: 1,
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

    async createUsers(session: SessionUser, createUsersDto: CreateUsersDto) {
        const errors = [];

        const users = [];
        for (const { name, email, role, role_group_ids } of createUsersDto.users) {
            const user = await this.userModel.findOne({ email });

            if (user) {
                const accountUser = await this.userModel.findOne({
                    user_id: user.id,
                    account_id: session.account_id,
                });

                const error = {};
                error['code'] = 'EXISTING_USER';
                error['message'] = `${email} is already associated with your account.`;

                if (!accountUser) {
                    error['message'] = `${email} is already associated with another partner.`;
                }

                errors.push(error);
                users.push(null);
                continue;
            }

            try {
                const code = await this.getUserCode(session.account_id);

                const newUser = new this.userModel();
                newUser.set('role', role);
                newUser.set('code', code);
                newUser.set('email', email);
                newUser.set('name', name);
                newUser.set('account_id', session.account_id);

                // Getting user roles from role groups.
                const roleGroups = await this.roleGroupModel
                    .find({ _id: { $in: role_group_ids }, account_id: session.account_id })
                    .lean({ virtuals: true });

                const roleGroupRoles = roleGroups.reduce((acc, roleGroup) => {
                    return uniq([...acc, roleGroup.type, ...roleGroup.roles]);
                }, []);

                newUser.set('access_controls', roleGroupRoles);
                newUser.set('role_group_ids', role_group_ids);
                newUser.set('invitation_source', InvitationSource.ADMIN);
                await newUser.save();

                // Sending invitation email
                this.eventEmitter.emit('user.send_invitation_email', newUser);

                // Trigger products XIRR sync for the new access control
                this.productsQueue.add(JobName.SYNC_MAX_RETURN_RATE, {
                    account_id: session.account_id,
                    user_id: session.user_id,
                    product_type: ProductType.LISTED_BOND,
                });

                this.productsQueue.add(JobName.SYNC_MAX_RETURN_RATE, {
                    account_id: session.account_id,
                    user_id: session.user_id,
                    product_type: ProductType.UNLISTED_EQUITY,
                });

                users.push({ ...newUser.toJSON() });
            } catch (error) {
                console.error(error);
                errors.push({ code: 'USER_CREATION_FAILED', message: error.message });
                users.push(null);
            }
        }

        const resUsers = {};

        // Removing false values from users array
        const compactUsers = users.filter((user) => user);

        if (errors.length) {
            resUsers['success'] = false;
            resUsers['errors'] = errors;
        }

        if (compactUsers.length) {
            resUsers['success'] = true;
            resUsers['data'] = compactUsers;
            resUsers['message'] = 'User(s) invitation sent successfully.';
        }

        return resUsers;
    }

    async deleteUser(session: SessionUser, user_id: string): Promise<ResProps> {
        const user = await this.userModel.findOne({ _id: user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const paymentsCount = await this.paymentModel.countDocuments({ advisor_id: user.id });

        if (paymentsCount > 0) {
            return {
                success: false,
                message:
                    'User cannot be deleted as they have transactions, please contact support.',
            };
        }

        // Check if the user is trying to delete their own account.
        if (session.user_id.toString() === user.id) {
            return {
                success: false,
                message: 'You cannot delete your own account.',
            };
        }

        // Check if the user has the permission to delete the account.
        if (!session.roles.includes(AccessControlList.DELETE_ACCOUNT_USERS)) {
            return {
                success: false,
                message: "You're not authorized to delete this user.",
            };
        }

        // Delete user customer links.
        await this.userCustomerModel.deleteMany({ user_id: user.id });

        // Delete user product links.
        await this.userProductModel.deleteMany({ user_id: user.id });

        // Delete user bank accounts.
        await this.bankAccountModel.deleteMany({ user_id: user.id });

        // Delete user.
        await user.deleteOne();

        return {
            success: true,
            message: 'User deleted successfully.',
        };
    }

    async editManagers(
        session: SessionUser,
        user_id: ObjectId,
        body: CreateUserLinksDto,
    ): Promise<ResProps> {
        // Delete managers from reportees.
        await this.userLinkModel.deleteMany({
            manager_id: user_id,
            reportee_id: { $in: body.link_ids },
        });

        // Delete managers from managers.
        await this.userLinkModel.deleteMany({
            reportee_id: user_id,
            manager_id: { $nin: body.link_ids },
        });

        const userLinkParams = {};
        userLinkParams['account_id'] = session.account_id;
        userLinkParams['reportee_id'] = user_id;

        await Promise.all(
            body.link_ids.map(async (link_id) => {
                userLinkParams['manager_id'] = link_id;
                return this.userLinkModel.findOneAndUpdate(
                    { ...userLinkParams },
                    { ...userLinkParams },
                    { upsert: true },
                );
            }),
        );

        return {
            success: true,
            message: 'User managers updated successfully.',
        };
    }

    async editReportees(
        session: SessionUser,
        user_id: ObjectId,
        body: CreateUserLinksDto,
    ): Promise<ResProps> {
        // Delete reportees from managers.
        await this.userLinkModel.deleteMany({
            reportee_id: user_id,
            manager_id: { $in: body.link_ids },
        });

        // Delete reportees from reportees.
        await this.userLinkModel.deleteMany({
            manager_id: user_id,
            reportee_id: { $nin: body.link_ids },
        });

        const userLinkParams = {};
        userLinkParams['account_id'] = session.account_id;
        userLinkParams['manager_id'] = user_id;

        await Promise.all(
            body.link_ids.map(async (link_id) => {
                userLinkParams['reportee_id'] = link_id;
                return this.userLinkModel.findOneAndUpdate(
                    { ...userLinkParams },
                    { ...userLinkParams },
                    { upsert: true },
                );
            }),
        );

        return {
            success: true,
            message: 'User reportees updated successfully.',
        };
    }

    async getBankAccount(user: SessionUser): Promise<BankAccount> {
        return this.bankAccountModel.findOne({ user_id: user.user_id });
    }

    private async _getCommissionReport(queryParams, session: SessionUser) {
        const [transactionsResult] = await this.paymentModel.aggregate([
            { $match: { ...queryParams } },
            { $sort: { created_at: -1 } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [],
                },
            },
            {
                $project: {
                    collection: 1,
                    total_count: { $first: '$total.count' },
                },
            },
        ]);
        const transactions = transactionsResult.collection;

        const productData = await this.bondsService.getProducts();
        let totalCommission = 0;

        await Promise.all(
            transactions.map(async (item: Payment) => {
                const response = await this.userProductModel.findOne({
                    user_id: session.user_id,
                    product_isin: item.product_isin,
                });
                let commission_rate;
                if (item.product_type === ProductType.UNLISTED_EQUITY) {
                    commission_rate = response?.max_return_rate;
                } else if (item.product_type === ProductType.MLD) {
                    commission_rate = 2;
                } else {
                    commission_rate = response?.max_return_rate - item.return_rate;
                }

                const { commission } = this.utilityService.calculateDirectCommission(
                    item,
                    productData.data,
                    isNaN(commission_rate) ? 0.005 : commission_rate,
                );

                totalCommission += Number(commission);
            }),
        );

        return totalCommission;
    }

    /**
     * This method returns all data required by the Admin Dashboard
     *
     */
    async getDashBoardData(): Promise<ResProps> {
        const [
            customersCount,
            verifiedCustomers,
            totalTransactions,
            totalAdvisors,
            uniqueAdvisorCount,
            aumBreakUp,
            monthwiseTransactionCounts,
            monthwiseCustomerCounts,
            monthwiseAdvisorCounts,
        ] = await Promise.all([
            this.customerModel.estimatedDocumentCount(),
            this.customerModel.countDocuments({ status: 'KYC Verified' }),
            this.paymentModel.estimatedDocumentCount(),
            this.userModel.estimatedDocumentCount(),
            this.paymentModel
                .aggregate([
                    {
                        $match: {
                            status: 'Order Processed',
                        },
                    },
                    {
                        $group: {
                            _id: '$advisor_id',
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            uniqueAdvisorCount: { $sum: 1 },
                        },
                    },
                ])
                .exec(),
            this.paymentModel
                .aggregate([
                    {
                        $match: {
                            product_type: {
                                $in: [ProductType.MLD, ProductType.BOND, ProductType.IPO],
                            },
                            status: 'Order Processed',
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
            this.aggregateMonthwiseCounts(this.paymentModel, 'created_at'),
            this.aggregateMonthwiseCounts(this.customerModel, 'created_at'),
            this.aggregateMonthwiseCounts(this.userModel, 'created_at'),
        ]);

        const activeAdvisors = uniqueAdvisorCount[0] ? uniqueAdvisorCount[0].uniqueAdvisorCount : 0;

        return {
            success: true,
            data: {
                customersCount,
                verifiedCustomers,
                totalTransactions,
                totalAdvisors,
                activeAdvisors,
                aumBreakUp,
                monthwiseTransactionCounts,
                monthwiseCustomerCounts,
                monthwiseAdvisorCounts,
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

    async getUserLinks(
        session: SessionUser,
        user_id: ObjectId,
        query: GetUserLinksDto,
    ): Promise<ResProps> {
        const queryParams = {};

        queryParams['account_id'] = session.account_id;
        queryParams['$or'] = [{ manager_id: user_id }, { reportee_id: user_id }];

        const userLinks = await this.userLinkModel
            .find({ ...queryParams })
            .select('type manager_id reportee_id account_id');

        return {
            success: true,
            data: {
                total_count: userLinks.length,
                collection: userLinks,
            },
        };
    }

    async getUserInvitation(
        session: SessionUser,
        _id: ObjectId,
    ): Promise<ResProps1<{ invitation_url: string }>> {
        const advisorRoleGroup = await this.roleGroupModel.findOne({
            account_id: session.account_id,
            type: '_RELATIONSHIP_ADVISOR',
        });

        if (!advisorRoleGroup) {
            return {
                success: false,
                message: "You're not authorized to invite users, please contact support.",
            };
        }

        const user = await this.userModel.findOne({ _id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const invitationToken = await this.jwtService.signAsync({
            sub: 'REPORTEE_REGISTRATION_LINK',
            manager_id: _id,
            role_group_id: advisorRoleGroup.id,
            user_role: UserRole.ADVISOR,
        });

        const clientURL = this.configService.get<string>('CLIENT_URL');
        const invitationUrl = `${clientURL}/auth/register?token=${invitationToken}`;

        return {
            success: true,
            data: { invitation_url: invitationUrl },
        };
    }

    async getUser(userId: string): Promise<ResProps> {
        const user = await this.userModel.findOne({ _id: userId });

        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        return {
            success: true,
            data: { ...user.toJSON() },
        };
    }

    async getUsers(session: SessionUser, getUsersDto: GetUsersDto): Promise<ResProps> {
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
        } else if (session.roles.includes(AccessControlList.LIST_MANAGED_USERS)) {
            searchParams['account_id'] = session.account_id;

            const reporteeIds = await this
                // Commenting helps keep this code in multiple lines.
                .getReporteeIds([String(session.user_id)])
                .then((ids) => ids.map((id) => new Types.ObjectId(id)));

            searchParams['_id'] = { $in: reporteeIds };
        }

        if (getUsersDto.status) {
            searchParams['status'] = getUsersDto.status;
        }

        if (getUsersDto.role_group) {
            searchParams['access_controls'] = { $in: [getUsersDto.role_group] };
        }

        if (getUsersDto.name) {
            searchParams['name'] = { $regex: new RegExp(getUsersDto.name, 'i') };
        }

        if (getUsersDto.role) {
            searchParams['role'] = getUsersDto.role;
        }

        if (getUsersDto.hours_ago > 0) {
            searchParams['created_at'] = { $gte: new Date(getUsersDto.hours_ago) };
        }

        const roleGroups = await this.roleGroupModel
            .find({ account_id: session.account_id })
            .lean({ virtuals: true });

        const [users] = await this.userModel.aggregate([
            { $match: { ...searchParams } },
            { $sort: { created_at: -1 } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [
                        { $skip: (getUsersDto.page - 1) * getUsersDto.per_page },
                        { $limit: getUsersDto.per_page },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                name: 1,
                                code: 1,
                                email: 1,
                                role: 1,
                                access_controls: 1,
                                status: 1,
                                invitation_date: '$created_at',
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    collection: 1,
                    total_count: { $first: '$total.count' },
                },
            },
        ]);

        const { collection, total_count } = users;

        return {
            success: true,
            data: {
                total_count,
                collection: collection.map((user) => ({
                    ...user,
                    role_groups: roleGroups
                        .map((roleGroup) => {
                            const arrayIncludes = this.utilityService.arrayIncludes;
                            const roleGroupRoles = [...roleGroup.roles, roleGroup.type];
                            return (
                                arrayIncludes(roleGroupRoles, user.access_controls, {
                                    every: true,
                                }) && roleGroup.name
                            );
                        })
                        .filter(Boolean),
                })),
                page: getUsersDto.page,
                per_page: getUsersDto.per_page,
            },
        };
    }

    // Getting unique user code with account prefix.
    private async getUserCode(accountId: ObjectId, stepCounter = 0): Promise<string> {
        const code = await this.usersRepository.getUserCode(accountId, stepCounter);
        const duplicateUser = await this.userModel.findOne({ code, account_id: accountId });

        if (duplicateUser) {
            console.log('🚀 ~ AccessControlsService ~ getUserCode ~ duplicateUser:', code);
            return await this.getUserCode(accountId, stepCounter + 1);
        }

        return code;
    }

    async getUserReport(session: SessionUser, query: GetUserReportDto): Promise<ResProps> {
        const queryParams = { status: OrderStatus.ORDER_PROCESSED };
        if (session.roles.includes(AccessControlList.LIST_ACCOUNT_ORDERS)) {
            /**
             * Access to view all payments in the account
             */
            queryParams['account_id'] = session.account_id;
        } else if (session.roles.includes(AccessControlList.LIST_MANAGED_ORDERS)) {
            /**
             * Access to view payments where the advisors are either
             * 1. the users reporting to current user or
             * 2. the current user themselves
             */
            const reportee_ids = (
                await this.userLinkModel.find({
                    account_id: session.account_id,
                    manager_id: session.user_id,
                })
            ).map((userLink) => userLink.reportee_id);

            queryParams['account_id'] = session.account_id;
            queryParams['advisor_id'] = {
                $in: reportee_ids.concat([session.user_id]), // reportees OR current user
            };
        } else if (session.roles.includes(AccessControlList.LIST_USER_ORDERS)) {
            /**
             * Access to view only the payments where the advisor is the current user
             */
            queryParams['account_id'] = session.account_id;
            queryParams['advisor_id'] = session.user_id;
        }

        const [transactionsResult] = await this.paymentModel.aggregate([
            { $match: { ...queryParams } },
            { $sort: { created_at: -1 } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [
                        { $skip: (query.page - 1) * query.per_page },
                        { $limit: query.per_page },
                    ],
                },
            },
            {
                $project: {
                    collection: 1,
                    total_count: { $first: '$total.count' },
                },
            },
        ]);
        const transactions = transactionsResult.collection;

        const productData = await this.bondsService.getProducts();

        const report = await Promise.all(
            transactions.map(async (item: Payment) => {
                const response = await this.userProductModel.findOne({
                    user_id: session.user_id,
                    product_isin: item.product_isin,
                });
                let commission_rate;
                if (item.product_type === ProductType.UNLISTED_EQUITY) {
                    commission_rate = response?.max_return_rate;
                } else if (item.product_type === ProductType.MLD) {
                    commission_rate = 2;
                } else {
                    commission_rate = response?.max_return_rate - item.return_rate;
                }

                const { commission, productTenure, daysInvested } =
                    this.utilityService.calculateDirectCommission(
                        item,
                        productData.data,
                        isNaN(commission_rate) ? 0.005 : commission_rate,
                    );

                const transactionData = {
                    customer_name: item.customer_name,
                    order_id: item.order_id,
                    type: item.type,
                    product_name: item.product_name,
                    units: item.units,
                    user_amount: item.user_amount,
                    status: item.status,
                    product_type: item.product_type,
                    transaction_date: item.ordered_at,
                };

                return {
                    ...transactionData,
                    commission: commission,
                    commission_rate: isNaN(commission_rate) ? 0.005 : commission_rate,
                    days_invested: daysInvested,
                    product_tenure: productTenure,
                };
            }),
        );

        const totalCommission = await this._getCommissionReport(queryParams, session);

        if (!report.length) {
            return { success: false, message: 'Report not found.' };
        }

        return {
            success: true,
            data: {
                report,
                totalCommission,
                total_count: transactionsResult.total_count,
                per_page: query.per_page,
                page: query.page,
            },
        };
    }

    async getUserSwitchInTransactions(session: SessionUser): Promise<ResProps> {
        const user = await this.userModel.findOne({ _id: session.user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const transactions = await this.mutualFundService.getMFTransactionSwitchInIFAData(
            user.code,
        );

        return transactions;
    }

    async getUserSwitchOutTransactions(session: SessionUser): Promise<ResProps> {
        const user = await this.userModel.findOne({ _id: session.user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const transactions = await this.mutualFundService.getMFTransactionSwitchOutIFAData(
            user.code,
        );

        return transactions;
    }

    async getUserTransactions(session: SessionUser): Promise<ResProps> {
        const user = await this.userModel.findOne({ _id: session.user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const transactions = await this.mutualFundService.getMFTransactionIFAData(user.code);

        return transactions;
    }

    async migrateRoleGroups() {
        const accounts = await this.accountModel.find().lean({ virtuals: true });
        debugger;

        for (const account of accounts) {
            const roleGroups = await this.roleGroupModel
                .find({ account_id: account._id })
                .lean({ virtuals: true });
            if (roleGroups.length > 0) {
                const users = await this.userModel
                    .find({ account_id: account._id, role_group_ids: { $size: 0 } })
                    .lean({ virtuals: true });

                if (users.length > 0) {
                    debugger;

                    for (const user of users) {
                        const roleGroupsIds = roleGroups
                            .map((roleGroup) => {
                                const arrayIncludes = this.utilityService.arrayIncludes;
                                const roleGroupRoles = [...roleGroup.roles, roleGroup.type];

                                return (
                                    arrayIncludes(roleGroupRoles, user.access_controls, {
                                        every: true,
                                    }) && roleGroup._id
                                );
                            })
                            .filter(Boolean);

                        console.log(
                            '🚀 ~ UsersService ~ migrateRoleGroups ~ roleGroupsIds:',
                            roleGroupsIds,
                        );

                        await this.userModel.updateOne(
                            { _id: user._id },
                            { role_group_ids: roleGroupsIds },
                        );
                    }
                }
            }
        }
    }

    async revokeUser(session: SessionUser, user_id: ObjectId): Promise<ResProps1<any>> {
        const resRevokeUser = await this.usersRepository.revokeUser(user_id);

        if (!resRevokeUser.success) return resRevokeUser;

        // TODO: Move this to events/consumers.
        this.userLogService.create({
            record_id: resRevokeUser.data.id,
            record_collection: User.name,
            record_action: 'USER_REVOKED',
            user_id: session.user_id,
            account_id: session.account_id,
        });

        return {
            success: true,
            message: 'User account revoked successfully.',
        };
    }

    async updateAddress(user_id: ObjectId, params: UpdateAddressDto): Promise<ResProps> {
        const user = await this.userModel.findOne({ _id: user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        user['address'] = params.address;
        user['city'] = params.city;
        user['pin_code'] = params.pin_code;
        user['state'] = params.state;
        await user.save();

        return {
            success: true,
            message: 'Address updated successfully.',
        };
    }

    async updateAccessControls(
        user_id: string,
        session: SessionUser,
        updateAccessControlsDto: UpdateAccessControlsDto,
    ): Promise<ResProps> {
        const user = await this.userModel
            .findOne({ _id: user_id, account_id: session.account_id })
            .select('name email status access_controls');

        if (!user) {
            return {
                success: false,
                errors: [
                    {
                        code: 'USER_NOT_FOUND',
                        message: 'User not found.',
                    },
                ],
                message: 'Could not update role, please contact support.',
            };
        }

        // TODO - Check if user is authorized to update access control

        // Getting user roles from role groups.
        const roleGroups = await this.roleGroupModel
            .find({
                _id: { $in: updateAccessControlsDto.role_group_ids },
                account_id: session.account_id,
            })
            .lean({ virtuals: true });

        const roleGroupRoles = roleGroups.reduce((memo, roleGroup) => {
            return uniq([...memo, roleGroup.type, ...roleGroup.roles]);
        }, []);
        debugger;

        user.set('access_controls', roleGroupRoles);
        user.set('role_group_ids', updateAccessControlsDto.role_group_ids);
        // user.set('status', body.status);
        user.set('status', UserStatus.ACCOUNT_ACTIVE);
        await user.save();

        return {
            success: true,
            data: { ...user.toJSON() },
        };
    }

    async updateBankAccount(
        user: SessionUser,
        params: UpdateBankAccountDto,
    ): Promise<{ message: string }> {
        const bankAccount = await this.bankAccountModel.findOne({ user_id: user.user_id });

        if (bankAccount) {
            await bankAccount.updateOne(params);
            return { message: 'Bank account details are updated.' };
        } else {
            await this.bankAccountModel.create({ user_id: user.user_id, ...params });
            return { message: 'Bank account details are updated.' };
        }
    }

    async updateUser(user_id: ObjectId, params: UpdateUserDto): Promise<ResProps> {
        const user = await this.userModel.findOne({ _id: user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        user['email'] = params.email;
        user['gender'] = params.gender;
        user['phone_number'] = params.phone_number;
        await user.save();

        return {
            success: true,
            message: 'Profile updated successfully.',
        };
    }
}
