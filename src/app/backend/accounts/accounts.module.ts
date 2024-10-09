import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/models/account.model';
import { User, UserSchema } from 'src/models/user.model';
import { UserCustomer, UserCustomerSchema } from 'src/models/user-customer.model';
import { Payment, PaymentSchema } from 'src/models/payment.model';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { AccountProduct, AccountProductSchema } from 'src/models/account-product.model';
import { UserProduct, UserProductSchema } from 'src/models/user-product.model';
import { AccountsRepository } from './accounts.repository';
import AttachmentService from 'src/services/attachment.service';
import {
    Attachment,
    AttachmentSchema,
    CustomerAttachment,
    CustomerAttachmentSchema,
    Resource,
    ResourceRoleGroup,
    ResourceRoleGroupSchema,
    ResourceSchema,
    UserLink,
    UserLinkSchema,
} from 'src/models';
import UploadService from 'src/services/upload.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Account.name, schema: AccountSchema },
            { name: User.name, schema: UserSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: Payment.name, schema: PaymentSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: AccountProduct.name, schema: AccountProductSchema },
            { name: UserProduct.name, schema: UserProductSchema },
            { name: Resource.name, schema: ResourceSchema },
            { name: ResourceRoleGroup.name, schema: ResourceRoleGroupSchema },
            { name: Attachment.name, schema: AttachmentSchema },
            { name: UserLink.name, schema: UserLinkSchema },
            { name: CustomerAttachment.name, schema: CustomerAttachmentSchema },
        ]),
    ],
    controllers: [AccountsController],
    providers: [AccountsService, AccountsRepository, AttachmentService, UploadService],
})
export class AccountsModule {}
