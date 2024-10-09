import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { CustomersSeederService } from './customers.seeder.service';
import UtilityService from 'src/services/utility.service';
import { HttpModule } from '@nestjs/axios';
import { UserCustomer, UserCustomerSchema } from 'src/models/user-customer.model';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
        ]),
    ],
    providers: [CustomersSeederService, UtilityService],
    exports: [CustomersSeederService],
})
export class CustomersSeederModule {}
