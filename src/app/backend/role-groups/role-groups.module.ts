import { Module } from '@nestjs/common';
import { RoleGroupsService } from './role-groups.service';
import { RoleGroupsController } from './role-groups.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleGroup, RoleGroupSchema } from 'src/models/role-group.model';
import { User, UserSchema } from 'src/models';
import { RoleGroupsRepository } from './role-groups.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: RoleGroup.name, schema: RoleGroupSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [RoleGroupsController],
    providers: [RoleGroupsService, RoleGroupsRepository],
})
export class RoleGroupsModule {}
