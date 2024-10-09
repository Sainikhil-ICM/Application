import { Module } from '@nestjs/common';
import { UserProductsService } from './user-products.service';
import { UserProductsController } from './user-products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProduct, UserProductSchema } from 'src/models/user-product.model';
import { AccountProduct, AccountProductSchema } from 'src/models/account-product.model';
import { RoleGroup, RoleGroupSchema } from 'src/models/role-group.model';
import { User, UserSchema } from 'src/models';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserProduct.name, schema: UserProductSchema },
            { name: AccountProduct.name, schema: AccountProductSchema },
            { name: RoleGroup.name, schema: RoleGroupSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [UserProductsController],
    providers: [UserProductsService],
})
export class UserProductsModule {}
