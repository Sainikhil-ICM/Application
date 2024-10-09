import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleGroup, RoleGroupSchema, User, UserSchema } from 'src/models';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: RoleGroup.name, schema: RoleGroupSchema },
        ]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
