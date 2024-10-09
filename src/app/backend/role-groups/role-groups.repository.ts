import * as uniq from 'lodash/uniq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoleGroup, RoleGroupDocument, User, UserDocument } from 'src/models';

@Injectable()
export class RoleGroupsRepository {
    protected readonly logger = new Logger(RoleGroupsRepository.name);

    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(RoleGroup.name)
        private roleGroupModel: Model<RoleGroupDocument>,
    ) {}

    /**
     * Updates the access controls for users based on the provided role group.
     * @param roleGroup - role group document.
     */
    async updateUserAccessControls(roleGroup: RoleGroupDocument) {
        const users = await this.userModel
            .find({
                account_id: roleGroup.account_id,
                role_group_ids: { $in: [roleGroup.id] },
            })
            .select('role_group_ids')
            .lean({ virtuals: true });

        for (const user of users) {
            // Getting user roles from role groups.
            const roleGroups = await this.roleGroupModel
                .find({ _id: { $in: user.role_group_ids } })
                .select('type roles')
                .lean({ virtuals: true });

            const roleGroupRoles = roleGroups.reduce((memo, roleGroup) => {
                return uniq([...memo, roleGroup.type, ...roleGroup.roles]);
            }, []);

            await this.userModel.updateOne(
                { _id: user._id },
                { $set: { access_controls: roleGroupRoles } },
            );
        }
    }
}
