import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/models/account.model';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import BondsService from 'src/services/bonds.service';
import UploadService from 'src/services/upload.service';
import { HttpModule } from '@nestjs/axios';
import { Attachment, AttachmentSchema } from 'src/models/attachment.model';
import { UserCustomer, UserCustomerSchema } from 'src/models/user-customer.model';
import AttachmentService from 'src/services/attachment.service';
import { CustomerAttachment, CustomerAttachmentSchema } from 'src/models/customer-attachment.model';
import { User, UserSchema } from 'src/models';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Account.name, schema: AccountSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: Attachment.name, schema: AttachmentSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: CustomerAttachment.name, schema: CustomerAttachmentSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [CustomersController],
    providers: [CustomersService, BondsService, UploadService, AttachmentService],
})
export class CustomersModule {}
