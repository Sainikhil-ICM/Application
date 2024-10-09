import { Module } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UserProfilesController } from './user-profiles.controller';
import { UserProfile, UserProfileSchema } from 'src/models/user-profile.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProfilesRepository } from './user-profiles.repository';
import AttachmentService from 'src/services/attachment.service';
import UploadService from 'src/services/upload.service';
import {
    Account,
    AccountSchema,
    Attachment,
    AttachmentSchema,
    Customer,
    CustomerAttachment,
    CustomerAttachmentSchema,
    CustomerSchema,
    RoleGroup,
    RoleGroupSchema,
    User,
    UserCustomer,
    UserCustomerSchema,
    UserSchema,
} from 'src/models';
import { HttpModule } from '@nestjs/axios';
import PinCodeService from 'src/services/pin-code/pin-code.service';
import { UsersRepository } from '../users/users.repository';
import { CryptoService } from 'src/services/crypto.service';
import { CustomersRepository } from '../customers/customers.repository';
import { CustomerProfile, CustomerProfileSchema } from 'src/models/customer-profile.model';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: UserProfile.name, schema: UserProfileSchema },
            { name: RoleGroup.name, schema: RoleGroupSchema },
            { name: Account.name, schema: AccountSchema },
            { name: Attachment.name, schema: AttachmentSchema },
            { name: CustomerAttachment.name, schema: CustomerAttachmentSchema },
            { name: User.name, schema: UserSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: CustomerProfile.name, schema: CustomerProfileSchema },
        ]),
    ],
    controllers: [UserProfilesController],
    providers: [
        UserProfilesService,
        CustomersRepository,
        UserProfilesRepository,
        UsersRepository,
        AttachmentService,
        UploadService,
        PinCodeService,
        CryptoService,
    ],
})
export class UserProfilesModule {}
