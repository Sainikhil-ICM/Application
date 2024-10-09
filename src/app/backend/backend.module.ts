import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ProductsModule } from './products/products.module';
import { AccountsModule } from './accounts/accounts.module';
import { UploadModule } from './upload/upload.module';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LeadsModule } from './leads/leads.module';
import { UserProductsModule } from './user-products/user-products.module';
import { RoleGroupsModule } from './role-groups/role-groups.module';
import { CommonModule } from './common.module';
import { ListenerModule } from './listener.module';
import { JwtModule } from '@nestjs/jwt';
import { ResourcesModule } from './resources/resources.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        EventEmitterModule.forRoot(),
        JwtModule.registerAsync({
            global: true,
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT.SECRET'),
                signOptions: { expiresIn: configService.get<string>('JWT.EXPIRES_IN') },
            }),
            inject: [ConfigService],
        }),
        BullModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>('REDIS.HOST'),
                    port: parseInt(configService.get<string>('REDIS.PORT')),
                },
            }),
            inject: [ConfigService],
        }),
        CommonModule,
        ListenerModule,
        AccountsModule,
        AuthModule,
        CustomersModule,
        PaymentsModule,
        ProductsModule,
        UploadModule,
        UsersModule,
        WebhooksModule,
        LeadsModule,
        UserProductsModule,
        RoleGroupsModule,
        ResourcesModule,
        UserProfilesModule,
        AdminModule,
        AnalyticsModule,
    ],
})
export class BackendModule {}
