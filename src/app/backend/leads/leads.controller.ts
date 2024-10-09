import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadReqDto } from './dto/request/create-lead.req.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserSession } from 'src/decorators/user-session.decorator';
import { SessionUser } from 'src/constants/user.const';
import GetLeadsReqDto from './dto/request/get-leads.req.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { VerifyOtpReqDto } from './dto/request/verify-otp.req.dto';

@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) {}

    @Post()
    @UseGuards(AuthGuard)
    createLead(@UserSession() session: SessionUser, @Body() body: CreateLeadReqDto) {
        return this.leadsService.createLead(session, body);
    }

    @Get()
    @UseGuards(AuthGuard)
    getLeads(@UserSession() session: SessionUser, @Query() query: GetLeadsReqDto) {
        return this.leadsService.getLeads(session, query);
    }

    @Post(':lead_id/resend-otp')
    resendOtp(@Param('lead_id', MongoIdPipe) lead_id: string) {
        return this.leadsService.resendOtp(lead_id);
    }

    @Post(':lead_id/verify-otp')
    verifyOtp(@Param('lead_id', MongoIdPipe) lead_id: string, @Body() body: VerifyOtpReqDto) {
        return this.leadsService.verifyOtp(lead_id, body);
    }

    @Get(':lead_id')
    getLead(@Param('lead_id') lead_id: string) {
        return this.leadsService.getLead(lead_id);
    }
}
