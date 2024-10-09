import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import BondsService from 'src/services/bonds.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from 'src/models/account.model';
import { User, UserSchema } from 'src/models';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Account.name, schema: AccountSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [ProductsController],
    providers: [ProductsService, BondsService],
})
export class ProductsModule {}
