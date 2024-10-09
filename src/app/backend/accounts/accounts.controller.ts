import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserSession } from 'src/decorators/user-session.decorator';
import { AccountsService } from './accounts.service';
import { SessionUser } from 'src/constants/user.const';
import { UpdateAccountReqDto } from './dto/request/update-account.req.dto';
import { GetAccountUsersReqDto } from './dto/request/get-account-users.dto';
import { GetResourcesDto } from './dto/get-resources.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';

@Controller('accounts')
export class AccountsController {
    constructor(private accountService: AccountsService) {}

    @UseGuards(AuthGuard)
    @Get(':account_id/overview')
    async getAccountOverview(
        @UserSession() session: SessionUser,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string,
    ) {
        return this.accountService.getAccountOverview(session, start_date, end_date);
    }

    @Get(':account_id/resources')
    async getResources(
        @Param('account_id', MongoIdPipe) account_id: string,
        @Query() getResourcesDto: GetResourcesDto,
    ) {
        return this.accountService.getResources(account_id, getResourcesDto);
    }

    @UseGuards(AuthGuard)
    @Get(':account_id/my-commission')
    async getMyCommission(@UserSession() session: SessionUser) {
        return this.accountService.getMyCommssion(session);
    }

    @UseGuards(AuthGuard)
    @Get(':account_id/account-commission')
    async getAccountCommission(@UserSession() session: SessionUser) {
        return this.accountService.getAccountCommission(session);
    }

    @UseGuards(AuthGuard)
    @Get(':account_id/users')
    async getUsers(@UserSession() session: SessionUser, @Query() query: GetAccountUsersReqDto) {
        return this.accountService.getUsers(session, query);
    }

    @UseGuards(AuthGuard)
    @Get(':account_id')
    async getAccount(@UserSession() session: SessionUser) {
        return this.accountService.getAccount(session);
    }

    @UseGuards(AuthGuard)
    @Patch(':account_id')
    // TODO: ACL ACCOUNT_ADMIN
    async updateAccount(@UserSession() session: SessionUser, @Body() body: UpdateAccountReqDto) {
        return this.accountService.updateAccount(session, body);
    }
}
