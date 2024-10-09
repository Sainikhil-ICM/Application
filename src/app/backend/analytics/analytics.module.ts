import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from './analytics.repository';
import {
    Account,
    AccountSchema,
    Payment,
    PaymentSchema,
    RoleGroup,
    RoleGroupSchema,
    User,
    UserCustomer,
    UserCustomerSchema,
    UserSchema,
} from 'src/models';
import { UsersRepository } from '../users/users.repository';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: User.name, schema: UserSchema },
            { name: RoleGroup.name, schema: RoleGroupSchema },
            { name: Account.name, schema: AccountSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService, AnalyticsRepository, UsersRepository],
})
export class AnalyticsModule {}
