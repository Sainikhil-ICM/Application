import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import { SessionUser } from 'src/constants/user.const';
import { IfaDashboardAnalyticsDto } from './dto/ifa-dashboard.dto';
import { UsersRepository } from '../users/users.repository';
import { AnalyticsGranularity } from 'src/constants/analytics.const';
import { ResProps } from 'src/constants/constants';

@Injectable()
export class AnalyticsService {
    constructor(
        private readonly analyticsRepository: AnalyticsRepository,
        private readonly usersRepository: UsersRepository,
    ) {}

    async getIfaDashboardSummary(session: SessionUser) {
        /**
         * total holdings
         * total customers
         * kyc verified customers
         * kyc pending customers
         * mf aum
         * total live sips
         * bonds aum
         * stocks aum
         * account transactions
         * account users
         * total commission
         */
    }

    async getIfaDashboardAum(
        session: SessionUser,
        ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ): Promise<ResProps> {
        try {
            const user = await this.usersRepository.getUserById(session.user_id);

            let results: any;
            if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.MONTH)
                results = await this.analyticsRepository.getIfaDashboardAumPerMonth(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );
            else if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.YEAR)
                results = await this.analyticsRepository.getIfaDashboardAumPerFiscalYear(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );

            return {
                success: true,
                data: {
                    results,
                },
            };
        } catch (error) {
            const errorMessage = 'Error fetching IFA Dashboard ~ AUM data';
            console.error(errorMessage, JSON.stringify({ ifaDashboardAnalyticsDto }), error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    async getIfaDashboardBrokerage(
        session: SessionUser,
        ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ): Promise<ResProps> {
        return {
            success: true,
            data: {
                results: [],
            },
        };
    }

    async getIfaDashboardGrossSales(
        session: SessionUser,
        ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ): Promise<ResProps> {
        try {
            const user = await this.usersRepository.getUserById(session.user_id);

            let results: any;
            if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.MONTH)
                results = await this.analyticsRepository.getIfaDashboardGrossSalesPerMonth(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );
            else if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.YEAR)
                results = await this.analyticsRepository.getIfaDashboardGrossSalesPerFiscalYear(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );

            return {
                success: true,
                data: {
                    results,
                },
            };
        } catch (error) {
            const errorMessage = 'Error fetching IFA Dashboard ~ Gross Sales data';
            console.error(errorMessage, JSON.stringify({ ifaDashboardAnalyticsDto }), error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    async getIfaDashboardNetSales(
        session: SessionUser,
        ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ): Promise<ResProps> {
        try {
            const user = await this.usersRepository.getUserById(session.user_id);

            let results: any;
            if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.MONTH)
                results = await this.analyticsRepository.getIfaDashboardNetSalesPerMonth(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );
            else if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.YEAR)
                results = await this.analyticsRepository.getIfaDashboardNetSalesPerFiscalYear(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );

            return {
                success: true,
                data: {
                    results,
                },
            };
        } catch (error) {
            const errorMessage = 'Error fetching IFA Dashboard ~ Net Sales data';
            console.error(errorMessage, JSON.stringify({ ifaDashboardAnalyticsDto }), error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    async getIfaDashboardSip(
        session: SessionUser,
        ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ): Promise<ResProps> {
        try {
            const user = await this.usersRepository.getUserById(session.user_id);

            let results: any;
            if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.MONTH)
                results = await this.analyticsRepository.getIfaDashboardSipPerMonth(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );
            else if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.YEAR)
                results = await this.analyticsRepository.getIfaDashboardSipPerFiscalYear(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );

            return {
                success: true,
                data: {
                    results,
                },
            };
        } catch (error) {
            const errorMessage = 'Error fetching IFA Dashboard ~ SIP data';
            console.error(errorMessage, JSON.stringify({ ifaDashboardAnalyticsDto }), error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    async getIfaDashboardCustomers(
        session: SessionUser,
        ifaDashboardAnalyticsDto: IfaDashboardAnalyticsDto,
    ): Promise<ResProps> {
        try {
            const user = await this.usersRepository.getUserById(session.user_id);

            let results: any;
            if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.MONTH)
                results = await this.analyticsRepository.getIfaDashboardCustomersPerMonth(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );
            else if (ifaDashboardAnalyticsDto.granularity === AnalyticsGranularity.YEAR)
                results = await this.analyticsRepository.getIfaDashboardCustomersPerFiscalYear(
                    user.id,
                    ifaDashboardAnalyticsDto.start_date,
                    ifaDashboardAnalyticsDto.end_date,
                );

            return {
                success: true,
                data: {
                    results,
                },
            };
        } catch (error) {
            const errorMessage = 'Error fetching IFA Dashboard ~ Customers data';
            console.error(errorMessage, JSON.stringify({ ifaDashboardAnalyticsDto }), error);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
}
