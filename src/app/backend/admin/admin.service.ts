import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SessionUser } from 'src/constants/user.const';
import { ResProps } from 'src/constants/constants';
import { GetUsersDto } from './dto/get-users.dto';
import { Model } from 'mongoose';
import UtilityService from 'src/services/utility.service';
import { RoleGroup, RoleGroupDocument, User, UserDocument } from 'src/models';

@Injectable()
export class AdminService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(RoleGroup.name)
        private roleGroupModel: Model<RoleGroupDocument>,
        private utilityService: UtilityService,
    ) {}

    arrayIncludes = this.utilityService.arrayIncludes;

    async getUsers(session: SessionUser, getUsersDto: GetUsersDto): Promise<ResProps> {
        const searchParams = {};

        if (getUsersDto.status) {
            searchParams['status'] = getUsersDto.status;
        }

        if (getUsersDto.role) {
            searchParams['access_controls'] = { $in: [getUsersDto.role] };
        }

        if (getUsersDto.name) {
            searchParams['name'] = { $regex: new RegExp(getUsersDto.name, 'i') };
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
}
