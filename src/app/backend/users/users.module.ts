import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.model';
import { BankAccount, BankAccountSchema } from 'src/models/bank-account.model';
import { Customer, CustomerSchema } from 'src/models/customer.model';
import { Payment, PaymentSchema } from 'src/models/payment.model';
import { UserProduct, UserProductSchema } from 'src/models/user-product.model';
import { HttpModule } from '@nestjs/axios';
import { UserLink, UserLinkSchema } from 'src/models/user-link.model';
import { RoleGroup, RoleGroupSchema } from 'src/models/role-group.model';
import { UserCustomer, UserCustomerSchema } from 'src/models/user-customer.model';
import { UsersRepository } from './users.repository';
import { BullModule } from '@nestjs/bull';
import { QueueName } from 'src/constants/constants';
import { Account, AccountSchema } from 'src/models';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: BankAccount.name, schema: BankAccountSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: Payment.name, schema: PaymentSchema },
            { name: UserProduct.name, schema: UserProductSchema },
            { name: UserLink.name, schema: UserLinkSchema },
            { name: RoleGroup.name, schema: RoleGroupSchema },
            { name: UserCustomer.name, schema: UserCustomerSchema },
            { name: Account.name, schema: AccountSchema },
        ]),
        BullModule.registerQueue({ name: QueueName.PRODUCTS_QUEUE }),
    ],
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
})
export class UsersModule {}
