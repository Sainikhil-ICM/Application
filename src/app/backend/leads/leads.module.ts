import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from 'src/models/lead.model';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { HttpModule } from '@nestjs/axios';
import { User, UserSchema } from 'src/models';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: Lead.name, schema: LeadSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [LeadsController],
    providers: [LeadsService],
})
export class LeadsModule {}
