import {
    Account,
    AccountDocument,
    RoleGroup,
    RoleGroupDocument,
    User,
    UserDocument,
    UserLink,
    UserLinkDocument,
} from 'src/models';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, Types, UpdateQuery } from 'mongoose';
import UtilityService from 'src/services/utility.service';

@Injectable()
export class AuthRepository {
    protected readonly logger = new Logger(AuthRepository.name);

    constructor(
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(RoleGroup.name)
        private roleGroupModel: Model<RoleGroupDocument>,
        @InjectModel(UserLink.name)
        private userLinkModel: Model<UserLinkDocument>,

        private readonly utilityService: UtilityService,
    ) {}

    arrayIncludes = this.utilityService.arrayIncludes;

    // async create(document: Omit<UserDocument, '_id'>): Promise<UserDocument> {
    //     const createdDocument = new this.userModel({
    //         ...document,
    //         _id: new Types.ObjectId(),
    //     });
    //     return (await createdDocument.save()).toJSON() as unknown as UserDocument;
    // }

    async findUser(filterQuery: FilterQuery<UserDocument>): Promise<UserDocument> {
        return this.userModel.findOne(filterQuery);
    }

    async getRoleGroup(filterQuery: FilterQuery<RoleGroupDocument>): Promise<RoleGroupDocument> {
        return this.roleGroupModel.findOne(filterQuery).lean({ virtuals: true });
    }

    // async getAccessControl(
    //     filterQuery: FilterQuery<AccessControlDocument>,
    // ): Promise<AccessControlDocument> {
    //     return this.accessControlModel.findOne(filterQuery).lean({ virtuals: true });
    // }

    async addLinkToManager(updateParams: UpdateQuery<UserLinkDocument>): Promise<UserLinkDocument> {
        return this.userLinkModel.findOneAndUpdate(
            { ...updateParams },
            { ...updateParams },
            { upsert: true },
        );
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

        debugger;
        return `${account.code_prefix}${lastUserCode + stepCounter + 1}`;
    }

    // async findOneAndUpdate(
    //     filterQuery: FilterQuery<UserDocument>,
    //     update: UpdateQuery<UserDocument>,
    // ): Promise<UserDocument> {
    //     const document = await this.userModel.findOneAndUpdate(filterQuery, update, {
    //         new: true,
    //     });

    //     if (!document) {
    //         this.logger.warn('Document was not found with filterQuery', filterQuery);
    //         throw new NotFoundException('Document was not found');
    //     }

    //     return document;
    // }

    // async find(filterQuery: FilterQuery<UserDocument>): Promise<UserDocument[]> {
    //     return this.userModel.find(filterQuery);
    // }

    // async findOneAndDelete(filterQuery: FilterQuery<UserDocument>): Promise<UserDocument> {
    //     return this.userModel.findOneAndDelete(filterQuery);
    // }
}
