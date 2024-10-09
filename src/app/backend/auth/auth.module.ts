import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { QueueName } from 'src/constants/constants';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.model';
import { HttpModule } from '@nestjs/axios';
import { Account, AccountSchema } from 'src/models/account.model';
import { AccountsConsumer } from 'src/jobs/consumers/accounts.consumer';
import { BullModule } from '@nestjs/bull';
import { RoleGroup, RoleGroupSchema } from 'src/models/role-group.model';
import { AuthRepository } from './auth.repository';
import { UserLink, UserLinkSchema } from 'src/models';
import { CryptoService } from 'src/services/crypto.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Account.name, schema: AccountSchema },
            { name: RoleGroup.name, schema: RoleGroupSchema },
            { name: UserLink.name, schema: UserLinkSchema },
        ]),
        BullModule.registerQueue({ name: QueueName.ACCOUNTS_QUEUE }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthRepository,
        AccountsConsumer,
        CryptoService,
        // {
        //     provide: 'APP_GUARD',
        //     useClass: AuthGuard,
        // },
    ],
})
export class AuthModule {}
