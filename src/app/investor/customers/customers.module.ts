import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customers.repository';

import {
    TempCustomer,
    TempCustomerSchema,
    Customer,
    CustomerSchema,
    UserCustomer,
    UserCustomerSchema,
    User,
    UserSchema,
    Attachment,
    AttachmentSchema,
    CustomerAttachment,
    CustomerAttachmentSchema,
} from 'src/models';
import { CustomerProfile, CustomerProfileSchema } from 'src/models/customer-profile.model';

import HyperVergeService from 'src/services/hyper-verge/hyper-verge.service';
import OnboardingService from 'src/services/onboarding/onboarding.service';
import AttachmentService from 'src/services/attachment.service';
import UploadService from 'src/services/upload.service';
import DigioService from 'src/services/digio/digio.service';
import UtilityService from 'src/services/utility.service';
import BondsHyperVergeService from 'src/services/hyper-verge/bonds-hyper-verge.service';
import BondsService from 'src/services/bonds.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: CustomerProfile.name, schema: CustomerProfileSchema },
            { name: TempCustomer.name, schema: TempCustomerSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: User.name, schema: UserSchema },
            { name: Attachment.name, schema: AttachmentSchema },
            { name: CustomerAttachment.name, schema: CustomerAttachmentSchema },
        ]),
    ],
    controllers: [CustomersController],
    providers: [
        CustomersService,
        CustomersRepository,
        HyperVergeService,
        OnboardingService,
        AttachmentService,
        UploadService,
        DigioService,
        UtilityService,
        BondsHyperVergeService,
        BondsService,
        UploadService,
    ],
})
export class CustomersModule {}
