import {
    Account,
    AccountDocument,
    RoleGroup,
    RoleGroupDocument,
    User,
    UserDocument,
} from 'src/models';
import { ResProps1 } from 'types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId } from 'mongoose';
import { UserRole, UserStatus } from 'src/constants/user.const';

@Injectable()
export class UsersRepository {
    protected readonly logger = new Logger(UsersRepository.name);

    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(RoleGroup.name)
        private roleGroupModel: Model<RoleGroupDocument>,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
    ) {}

    async revokeUser(_id: ObjectId): Promise<ResProps1<UserDocument>> {
        const user = await this.userModel.findOne({ _id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        user.set('status', UserStatus.ACCOUNT_REVOKED);
        await user.save();

        return {
            success: true,
            data: user,
            message: 'User account updated successfully.',
        };
    }

    /**
     * Function to get users of the account
     *
     * If the 2nd param, userIds, is empty, the function returns all the users in the account
     * If the 2nd param, userIds, contains a list of user IDs, the function returns the users of whom the user IDs are given
     */
    async exportUsers(
        accountId: ObjectId,
        userIds?: string[],
        userStatusList?: UserStatus[],
        userRoles: UserRole[] = [],
    ): Promise<UserDocument[]> {
        const usersQuery: FilterQuery<UserDocument> = { account_id: accountId };

        if (userIds?.length) usersQuery._id = { $in: userIds };
        if (userStatusList?.length) usersQuery.status = { $in: userStatusList };

        const exportUserIds = await this.userModel.distinct('_id', usersQuery);
        const exportUsersQuery: FilterQuery<UserDocument> = { _id: { $in: exportUserIds } };

        if (userRoles?.length) exportUsersQuery.role = { $in: userRoles };

        return this.userModel.find({ ...exportUsersQuery });
    }

    async getUserById(userId: ObjectId): Promise<UserDocument> {
        return this.userModel.findById(userId);
    }

    /**
     * Getting unique user code with account prefix.
     * @param accountId - The ID of the account.
     * @param stepCounter - The step counter value.
     * @returns A Promise that resolves to the user code.
     */
    async getUserCode(accountId: ObjectId, stepCounter: number): Promise<string> {
        const account = await this.accountModel
            .findOne({ _id: accountId })
            .select('_id code_prefix');

        const lastUser = await this.userModel
            .findOne({ account_id: accountId })
            .sort({ _id: -1 })
            .select('code');

        let lastUserCode = 0;

        if (lastUser) {
            const match = lastUser.code.match(/\d+/);
            lastUserCode = match ? parseInt(match[0], 10) : null;
        }

        return `${account.code_prefix}${lastUserCode + stepCounter + 1}`;
    }
}
