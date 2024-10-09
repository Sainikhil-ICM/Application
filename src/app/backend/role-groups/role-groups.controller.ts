import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { RoleGroupsService } from './role-groups.service';
import { CreateRoleGroupDto } from './dto/create-role-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserSession } from 'src/decorators/user-session.decorator';
import { SessionUser } from 'src/constants/user.const';
import { GetRoleGroupsDto } from './dto/get-role-groups.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { ObjectId } from 'mongoose';

@Controller('role-groups')
export class RoleGroupsController {
    constructor(private readonly roleGroupsService: RoleGroupsService) {}

    @Post()
    @UseGuards(AuthGuard)
    createRoleGroup(@UserSession() session: SessionUser, @Body() body: CreateRoleGroupDto) {
        return this.roleGroupsService.createRoleGroup(session, body);
    }

    @Get()
    @UseGuards(AuthGuard)
    getRoleGroups(@UserSession() session: SessionUser, @Query() query: GetRoleGroupsDto) {
        return this.roleGroupsService.getRoleGroups(session, query);
    }

    @Get(':role_group_id/invitation')
    @UseGuards(AuthGuard)
    getRoleGroupInvitation(@Param('role_group_id', MongoIdPipe) role_group_id: ObjectId) {
        return this.roleGroupsService.getRoleGroupInvitation(role_group_id);
    }

    @Patch(':role_group_id')
    @UseGuards(AuthGuard)
    updateRoleGroup(
        @Param('role_group_id', MongoIdPipe) role_group_id: ObjectId,
        @Body() updateRoleGroupDto: UpdateRoleGroupDto,
    ) {
        return this.roleGroupsService.updateRoleGroup(role_group_id, updateRoleGroupDto);
    }

    @Delete(':role_group_id')
    @UseGuards(AuthGuard)
    deleteRoleGroup(@Param('role_group_id', MongoIdPipe) role_group_id: ObjectId) {
        return this.roleGroupsService.deleteRoleGroup(role_group_id);
    }
}
