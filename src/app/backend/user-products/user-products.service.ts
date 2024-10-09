import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserProduct, UserProductDocument } from 'src/models/user-product.model';
import { Model } from 'mongoose';
import { SessionUser } from 'src/constants/user.const';
import { GetUserProductGroupsDto } from './dto/get-user-product-groups.dto';
import { CreateUserProductGroupDto } from './dto/create-user-product-group.dto';
import { GetUserProductsDto } from './dto/get-user-products.dto';
import UtilityService from 'src/services/utility.service';
import { AccountProduct, AccountProductDocument } from 'src/models/account-product.model';
import { RoleGroup, RoleGroupDocument } from 'src/models/role-group.model';
import { ProductType } from 'src/constants/product.const';

@Injectable()
export class UserProductsService {
    constructor(
        @InjectModel(UserProduct.name)
        private userProductModel: Model<UserProductDocument>,
        @InjectModel(AccountProduct.name)
        private accountProductModel: Model<AccountProductDocument>,
        @InjectModel(RoleGroup.name)
        private roleGroupModel: Model<RoleGroupDocument>,

        private utilityService: UtilityService,
    ) {}

    async createUserProductGroup(
        session: SessionUser,
        productType: ProductType,
        createUserProductGroupDto: CreateUserProductGroupDto,
    ) {
        const { max_return_rate, min_price_deviation, max_price_deviation } =
            createUserProductGroupDto;

        const accountProduct = await this.accountProductModel.findOne({
            account_id: session.account_id,
            product_isin: createUserProductGroupDto.product_isin,
        });

        if (!accountProduct) {
            return {
                success: false,
                message: 'Account product not found.',
            };
        }

        if (productType == ProductType.LISTED_BOND) {
            if (accountProduct.max_return_rate < max_return_rate) {
                return {
                    success: false,
                    message: `Maximum return rate cannot be greater than ${accountProduct.max_return_rate}.`,
                };
            }
        }

        if (productType == ProductType.UNLISTED_EQUITY) {
            if (accountProduct.min_price_deviation < min_price_deviation) {
                return {
                    success: false,
                    message: `Minimum price deviation cannot be greater than ${accountProduct.min_price_deviation}.`,
                };
            }

            // if (accountProduct.max_price_deviation < max_price_deviation) {
            //     return {
            //         success: false,
            //         message: `Maximum price deviation cannot be greater than ${accountProduct.max_price_deviation}.`,
            //     };
            // }
        }

        await this.userProductModel.updateMany(
            { _id: { $in: createUserProductGroupDto.user_product_ids } },
            {
                group_name: createUserProductGroupDto.group_name,
                max_return_rate: createUserProductGroupDto.max_return_rate,
                min_price_deviation: createUserProductGroupDto.min_price_deviation,
                // max_price_deviation: createUserProductGroupDto.max_price_deviation,
            },
        );

        return {
            success: true,
            message: 'User product group created successfully.',
        };
    }

    async getUserProducts(session: SessionUser, query: GetUserProductsDto) {
        const queryParams = {};
        const usersQuery = {};
        queryParams['account_id'] = session.account_id;

        if (query.product_isin) {
            queryParams['product_isin'] = query.product_isin;
        }

        if (query.status) {
            usersQuery['status'] = query.status;
        }

        const roleGroups = await this.roleGroupModel
            .find({ account_id: session.account_id })
            .lean({ virtuals: true });

        const [users] = await this.userProductModel.aggregate([
            { $match: { ...queryParams } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [
                        { $sort: { created_at: -1 } },
                        { $skip: (query.page - 1) * query.per_page },
                        { $limit: query.per_page },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'user_id',
                                foreignField: '_id',
                                as: 'user',
                                pipeline: [{ $match: { ...usersQuery } }],
                            },
                        },
                        { $unwind: '$user' },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                max_return_rate: 1,
                                group_name: 1,
                                user_name: '$user.name',
                                user_email: '$user.email',
                                status: '$user.status',
                                access_controls: '$user.access_controls',
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
                collection: collection.map((users) => ({
                    ...users,
                    role_groups: roleGroups
                        .map((roleGroup) => {
                            const arrayIncludes = this.utilityService.arrayIncludes;
                            const roleGroupRoles = [...roleGroup.roles, roleGroup.type];
                            return (
                                arrayIncludes(roleGroupRoles, users.access_controls, {
                                    every: true,
                                }) && roleGroup.name
                            );
                        })
                        .filter(Boolean),
                })),
                page: query.page,
                per_page: query.per_page,
            },
        };
    }

    async getUserProductGroups(session: SessionUser, query: GetUserProductGroupsDto) {
        const queryParams = {};

        queryParams['product_isin'] = query.product_isin;
        queryParams['account_id'] = session.account_id;
        queryParams['group_name'] = { $exists: true };

        const [userProductGroups] = await this.userProductModel.aggregate([
            { $match: { ...queryParams } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [
                        { $sort: { created_at: -1 } },
                        { $skip: (query.page - 1) * query.per_page },
                        { $limit: query.per_page },
                        {
                            $group: {
                                _id: '$group_name',
                                group_name: { $first: '$group_name' },
                                max_return_rate: { $first: '$max_return_rate' },
                                min_price_deviation: { $first: '$min_price_deviation' },
                                max_price_deviation: { $first: '$max_price_deviation' },
                                product_isin: { $first: '$product_isin' },
                                user_products: { $push: '$$ROOT' },
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

        return {
            success: true,
            data: {
                ...userProductGroups,
                page: query.page,
                per_page: query.per_page,
            },
        };
    }
}
