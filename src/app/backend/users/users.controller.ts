import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { UsersService } from './users.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { SessionUser } from 'src/constants/user.const';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { GetUserLinksDto } from './dto/get-user-links.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { CreateUserLinksDto } from './dto/create-user-links.dto';
import { ObjectId } from 'mongoose';
import { GetUserReportDto } from './dto/get-user-report.dto';
import { isMongoId } from 'class-validator';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateAccessControlsDto } from './dto/update-access-controls.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private userService: UsersService) {}

    @Get()
    async getUsers(@UserSession() session: SessionUser, @Query() getUsersDto: GetUsersDto) {
        return this.userService.getUsers(session, getUsersDto);
    }

    @Get('seed')
    async getSeedUsers() {
        return this.userService.migrateRoleGroups();
    }

    @Post()
    async createUsers(@UserSession() session: SessionUser, @Body() createUsersDto: CreateUsersDto) {
        return this.userService.createUsers(session, createUsersDto);
    }

    @Patch(':user_id/access-controls')
    updateAccessControls(
        @Param('user_id', MongoIdPipe) user_id: string,
        @UserSession() session: SessionUser,
        @Body() updateAccessControlsDto: UpdateAccessControlsDto,
    ) {
        return this.userService.updateAccessControls(user_id, session, updateAccessControlsDto);
    }

    @Get('bank-account')
    async getBankAccount(@UserSession() user: SessionUser) {
        return this.userService.getBankAccount(user);
    }

    @Get('dashboard')
    async getDashboardData() {
        return this.userService.getDashBoardData();
    }

    @Get('transactions')
    @UseGuards(AuthGuard)
    getUserTransactions(@UserSession() session: SessionUser) {
        return this.userService.getUserTransactions(session);
    }

    @Get('switch-in-transactions')
    @UseGuards(AuthGuard)
    getUserSwitchInTransactions(@UserSession() session: SessionUser) {
        return this.userService.getUserSwitchInTransactions(session);
    }

    @Get('switch-out-transactions')
    @UseGuards(AuthGuard)
    getUserSwitchOutTransactions(@UserSession() session: SessionUser) {
        return this.userService.getUserSwitchOutTransactions(session);
    }

    @Post('bank-account')
    async updateBankAccount(
        @UserSession() user: SessionUser,
        @Body() params: UpdateBankAccountDto,
    ) {
        return this.userService.updateBankAccount(user, params);
    }

    @Get(':user_id/report')
    async getUserReport(@UserSession() session, @Query() query: GetUserReportDto) {
        return this.userService.getUserReport(session, query);
    }

    @Post(':user_id')
    async updateUser(
        @UserSession() user: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: string,
        @Body() body: UpdateUserDto,
    ) {
        if (String(user.user_id) === user_id) {
            return this.userService.updateUser(user.user_id, body);
        } else {
            throw new UnauthorizedException();
        }
    }

    @Post(':user_id/address')
    async updateAddress(
        @UserSession() user: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: string,
        @Body() params: UpdateAddressDto,
    ) {
        if (String(user.user_id) === user_id) {
            return this.userService.updateAddress(user.user_id, params);
        } else {
            throw new UnauthorizedException();
        }
    }

    @Post(':user_id/managers')
    async editManagers(
        @UserSession() session: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: ObjectId,
        @Body() body: CreateUserLinksDto,
    ) {
        return this.userService.editManagers(session, user_id, body);
    }

    @Post(':user_id/reportees')
    async editReportees(
        @UserSession() session: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: ObjectId,
        @Body() body: CreateUserLinksDto,
    ) {
        return this.userService.editReportees(session, user_id, body);
    }

    @Get(':user_id/user-links')
    async getUserLinks(
        @UserSession() session: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: ObjectId,
        @Query() query: GetUserLinksDto,
    ) {
        return this.userService.getUserLinks(session, user_id, query);
    }

    @Patch(':user_id/revoke')
    async revokeUser(
        @UserSession() session: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: ObjectId,
    ) {
        return this.userService.revokeUser(session, user_id);
    }

    @Get(':user_id')
    async getUser(@UserSession() session: SessionUser, @Param('user_id') user_id: string) {
        const userId = isMongoId(user_id) ? user_id : String(session.user_id);
        return this.userService.getUser(userId);
    }

    @Delete(':user_id')
    async deleteUser(
        @UserSession() session: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: string,
    ) {
        return this.userService.deleteUser(session, user_id);
    }

    @Get(':user_id/invitation')
    @UseGuards(AuthGuard)
    getRoleGroupInvitation(
        @UserSession() session: SessionUser,
        @Param('user_id', MongoIdPipe) user_id: ObjectId,
    ) {
        return this.userService.getUserInvitation(session, user_id);
    }
}
