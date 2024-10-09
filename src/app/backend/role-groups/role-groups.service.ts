import { Injectable } from '@nestjs/common';
import { CreateRoleGroupDto } from './dto/create-role-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { SessionUser, UserRole } from 'src/constants/user.const';
import { GetRoleGroupsDto } from './dto/get-role-groups.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RoleGroup, RoleGroupDocument } from 'src/models/role-group.model';
import { Model, ObjectId } from 'mongoose';
import UtilityService from 'src/services/utility.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResProps1 } from 'types';
import { RoleGroupsRepository } from './role-groups.repository';

@Injectable()
export class RoleGroupsService {
    constructor(
        @InjectModel(RoleGroup.name)
        private readonly roleGroupModel: Model<RoleGroupDocument>,

        private readonly utilityService: UtilityService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly roleGroupsRepository: RoleGroupsRepository,
    ) {}

    async createRoleGroup(session: SessionUser, body: CreateRoleGroupDto) {
        const toKebabCase = this.utilityService.toKebabCase;
        const roleGroupType = toKebabCase(body.name, { caseType: 'upper' });

        const roleGroup = await this.roleGroupModel.findOne({
            account_id: session.account_id,
            type: roleGroupType,
        });

        if (roleGroup) {
            return {
                success: false,
                message: `Access Control ${body.name} already exists.`,
            };
        }

        const newRoleGroup = new this.roleGroupModel();
        newRoleGroup.set('name', body.name);
        newRoleGroup.set('description', body.description);
        newRoleGroup.set('type', `_${roleGroupType}`);
        newRoleGroup.set('roles', body.roles);
        newRoleGroup.set('account_id', session.account_id);

        await newRoleGroup.save();

        return {
            success: true,
            message: 'Access Control created successfully.',
        };
    }

    async getRoleGroups(session: SessionUser, query: GetRoleGroupsDto) {
        const queryParams = {};

        queryParams['account_id'] = session.account_id;

        if (query.permissions) {
            queryParams['roles'] = { $in: [query.permissions] };
        }

        const [roleGroups] = await this.roleGroupModel.aggregate([
            { $match: { ...queryParams } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [
                        { $sort: { created_at: -1 } },
                        { $skip: (query.page - 1) * query.per_page },
                        { $limit: query.per_page },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                name: 1,
                                type: 1,
                                description: 1,
                                is_editable: 1,
                                roles: 1,
                                account_id: 1,
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
                ...roleGroups,
                page: query.page,
                per_page: query.per_page,
            },
        };
    }

    async updateRoleGroup(role_group_id: ObjectId, updateRoleGroupDto: UpdateRoleGroupDto) {
        const roleGroup = await this.roleGroupModel
            .findOne({ _id: role_group_id, is_editable: true })
            .select('account_id name description roles');

        if (!roleGroup) {
            return {
                success: false,
                message: 'Access Control not found.',
            };
        }

        roleGroup.set('name', updateRoleGroupDto.name);
        roleGroup.set('description', updateRoleGroupDto.description);
        roleGroup.set('roles', updateRoleGroupDto.roles);

        await roleGroup.save();

        // TODO: Notify users of the role group edit.
        // Update the group roles for all the users.
        this.roleGroupsRepository.updateUserAccessControls(roleGroup);

        return {
            success: true,
            message: 'Access Control is updated and the changes are applied to the users.',
        };
    }

    async deleteRoleGroup(role_group_id: ObjectId) {
        const roleGroup = await this.roleGroupModel
            .findOne({ _id: role_group_id, is_editable: true })
            .select('id');

        if (!roleGroup) {
            return {
                success: false,
                message: 'You cannot delete this role group, please contact support.',
            };
        }

        await roleGroup.deleteOne();

        return {
            success: true,
            message: 'Access Control removed successfully.',
        };
    }

    async getRoleGroupInvitation(_id: ObjectId): Promise<ResProps1<{ invitation_url: string }>> {
        const roleGroup = await this.roleGroupModel.findOne({ _id });

        if (!roleGroup) {
            return {
                success: false,
                message: 'Access Control not found.',
            };
        }

        // We're defaulting it to ADVISOR for now.
        const invitationToken = await this.jwtService.signAsync({
            sub: 'ROLE_GROUP_INVITATION_LINK',
            id: _id,
            user_role: UserRole.ADVISOR,
        });

        const clientURL = this.configService.get<string>('CLIENT_URL');
        const invitationUrl = `${clientURL}/auth/register?token=${invitationToken}`;

        return {
            success: true,
            data: { invitation_url: invitationUrl },
        };
    }
}
