import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { UserProfileStatus } from 'src/constants/user-profile.const';
import { Account, AccountDocument, User, UserDocument } from 'src/models';
import { UserProfile, UserProfileDocument } from 'src/models/user-profile.model';

@Injectable()
export class UserProfilesRepository {
    protected readonly logger = new Logger(UserProfilesRepository.name);

    constructor(
        @InjectModel(UserProfile.name)
        private userProfileModel: Model<UserProfileDocument>,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) {}

    async createUserProfile(params: Partial<UserProfileDocument>) {
        return this.userProfileModel.findOneAndUpdate(
            {
                user_id: params.user_id,
                account_id: params.account_id,
            },
            { ...params },
            { upsert: true, background: true, new: true },
        );
    }

    async updateUserProfile(
        filterQuery: FilterQuery<UserProfileDocument>,
        updateQuery: UpdateQuery<UserProfileDocument>,
    ) {
        if (updateQuery.status === UserProfileStatus.REJECTED) {
            updateQuery.is_consent_given = false;
        }

        return this.userProfileModel.findOneAndUpdate(
            { ...filterQuery },
            { ...updateQuery },
            { new: true },
        );
    }

    async updateUserStatus(
        filterQuery: FilterQuery<UserDocument>,
        updateQuery: UpdateQuery<UserDocument>,
    ) {
        return this.userModel.findOneAndUpdate({ ...filterQuery }, { ...updateQuery });
    }

    async getUserProfile(
        filterQuery: FilterQuery<UserProfileDocument>,
    ): Promise<UserProfileDocument> {
        return this.userProfileModel.findOne(filterQuery);
    }

    async getAccountLogo(filterQuery: FilterQuery<AccountDocument>): Promise<any> {
        const account = await this.accountModel
            .findOne(filterQuery)
            .select('logo')
            .lean({ virtuals: true });
        return account.logo;
    }

    // async revokeUser(user_id: ObjectId): Promise<ResProps1<AccessControlDocument>> {
    //     const accessControl = await this.accessControlModel.findOne({ user_id });

    //     if (!accessControl) {
    //         return {
    //             success: false,
    //             message: 'Access control not found.',
    //         };
    //     }

    //     accessControl.set({ status: AccessControlStatus.ACCOUNT_REVOKED });
    //     await accessControl.save();

    //     return {
    //         success: true,
    //         data: accessControl,
    //         message: 'User account updated successfully.',
    //     };
    // }
}
