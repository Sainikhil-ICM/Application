import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { User, UserSchema } from 'src/models/user.model';
import UploadService from 'src/services/upload.service';
import { Attachment, AttachmentSchema } from 'src/models/attachment.model';
import { UserCustomer, UserCustomerSchema } from 'src/models/user-customer.model';
import { ValidateDematMiddleware } from '../../../middlewares/validate-demat.middleware';
import { Account, AccountSchema } from 'src/models/account.model';
import { ValidateCustomerKycMiddleware } from 'src/middlewares/is-kyc-valid.middleware';
import { CustomerAttachment, CustomerAttachmentSchema } from 'src/models/customer-attachment.model';
import AttachmentService from 'src/services/attachment.service';
import { UserLink, UserLinkSchema } from 'src/models/user-link.model';
import MutualFundService from 'src/services/mutual-fund/mutual-fund.service';

import BondsHyperVergeService from 'src/services/hyper-verge/bonds-hyper-verge.service';
import HyperVergeService from 'src/services/hyper-verge/hyper-verge.service';
import { CustomersRepository } from './customers.repository';
import { CustomerProfile, CustomerProfileSchema } from 'src/models/customer-profile.model';
import DigioService from 'src/services/digio/digio.service';
import { UsersRepository } from '../users/users.repository';
import { RoleGroup, RoleGroupSchema } from 'src/models';

// import { ClientsModule, Transport } from '@nestjs/microservices';
// import { APP_INTERCEPTOR } from '@nestjs/core';
// import { TransformInterceptor } from 'src/interceptors/transform.interceptor';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: UserLink.name, schema: UserLinkSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: Account.name, schema: AccountSchema },
            { name: Attachment.name, schema: AttachmentSchema },
            { name: CustomerAttachment.name, schema: CustomerAttachmentSchema },
            { name: CustomerProfile.name, schema: CustomerProfileSchema },
            { name: User.name, schema: UserSchema },
            { name: RoleGroup.name, schema: RoleGroupSchema },
        ]),

        // ClientsModule.register([
        //     {
        //         name: 'CUSTOMER_SERVICE',
        //         transport: Transport.TCP,
        //         options: { port: 3001 },
        //     },
        // ]),
    ],
    controllers: [CustomersController],
    providers: [
        UploadService,
        AttachmentService,
        CustomersService,
        BondsHyperVergeService,
        HyperVergeService,
        MutualFundService,
        CustomersRepository,
        DigioService,
        UsersRepository,

        // {
        //     provide: APP_INTERCEPTOR,
        //     useClass: TransformInterceptor,
        // },
    ],
})
export class CustomersModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ValidateDematMiddleware)
            .forRoutes(
                { path: 'customers', method: RequestMethod.POST },
                { path: 'customers/get-verification-token', method: RequestMethod.POST },
                { path: 'customers/assisted-kyc/verify-bank-account', method: RequestMethod.POST },
            )
            .apply(ValidateCustomerKycMiddleware)
            .forRoutes(
                {
                    path: 'customers/:id/accept-reject-kyc',
                    method: RequestMethod.POST,
                },
                {
                    path: 'customers/:id/validate-kyc',
                    method: RequestMethod.GET,
                },
            );
    }
}
