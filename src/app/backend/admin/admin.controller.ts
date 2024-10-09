import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { SessionUser } from 'src/constants/user.const';
import { GetUsersDto } from './dto/get-users.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('users')
    async getUsers(@UserSession() session: SessionUser, @Query() query: GetUsersDto) {
        return this.adminService.getUsers(session, query);
    }
}
