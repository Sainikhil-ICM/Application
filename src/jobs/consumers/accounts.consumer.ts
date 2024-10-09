import { Processor, Process } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { roleGroups } from 'src/app/backend/role-groups/role-groups.data';
import { JobName, QueueName } from 'src/constants/constants';
import { Account, AccountDocument } from 'src/models/account.model';
import { RoleGroup, RoleGroupDocument } from 'src/models/role-group.model';

@Processor(QueueName.ACCOUNTS_QUEUE)
export class AccountsConsumer {
    constructor(
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        @InjectModel(RoleGroup.name)
        private roleGroupModel: Model<RoleGroupDocument>,
    ) {}

    @Process(JobName.SEED_ROLE_GROUPS)
    async createRoleGroups(job: Job<AccountDocument>) {
        await Promise.all(
            Object.values(roleGroups).map(async (roleGroup) => {
                return this.roleGroupModel.findOneAndUpdate(
                    {
                        account_id: job.data.id,
                        type: roleGroup.type,
                    },
                    {
                        name: roleGroup.name,
                        roles: roleGroup.roles,
                        description: roleGroup.description,
                        is_editable: true,
                    },
                    { upsert: true },
                );
            }),
        );
    }
}
