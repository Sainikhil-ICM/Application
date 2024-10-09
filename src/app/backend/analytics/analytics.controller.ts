import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AnalyticsService } from './analytics.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { SessionUser } from 'src/constants/user.const';
import { IfaDashboardAnalyticsDto } from './dto/ifa-dashboard.dto';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('dashboard/ifa/summary')
    getIfaDashboardSummary(@UserSession() session: SessionUser) {
        return this.analyticsService.getIfaDashboardSummary(session);
    }

    @Get('dashboard/ifa/aum')
    getIfaDashboardAum(
        @UserSession() session: SessionUser,
        @Query() ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ) {
        return this.analyticsService.getIfaDashboardAum(session, ifaDashboardAnalyticsDto);
    }

    @Get('dashboard/ifa/brokerage')
    getIfaDashboardBrokerage(
        @UserSession() session: SessionUser,
        @Query() ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ) {
        return this.analyticsService.getIfaDashboardBrokerage(session, ifaDashboardAnalyticsDto);
    }

    @Get('dashboard/ifa/gross-sales')
    getIfaDashboardGrossSales(
        @UserSession() session: SessionUser,
        @Query() ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ) {
        return this.analyticsService.getIfaDashboardGrossSales(session, ifaDashboardAnalyticsDto);
    }

    @Get('dashboard/ifa/net-sales')
    getIfaDashboardNetSales(
        @UserSession() session: SessionUser,
        @Query() ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ) {
        return this.analyticsService.getIfaDashboardNetSales(session, ifaDashboardAnalyticsDto);
    }

    @Get('dashboard/ifa/sip')
    getIfaDashboardSip(
        @UserSession() session: SessionUser,
        @Query() ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ) {
        return this.analyticsService.getIfaDashboardSip(session, ifaDashboardAnalyticsDto);
    }

    @Get('dashboard/ifa/customers')
    getIfaDashboardCustomers(
        @UserSession() session: SessionUser,
        @Query() ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ) {
        return this.analyticsService.getIfaDashboardCustomers(session, ifaDashboardAnalyticsDto);
    }
}
