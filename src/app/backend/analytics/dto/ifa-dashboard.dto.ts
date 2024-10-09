import { IsDefined, IsEnum, IsString } from 'class-validator';
import { AnalyticsGranularity } from 'src/constants/analytics.const';

export class IfaDashboardAnalyticsDto {
    @IsDefined()
    @IsEnum(AnalyticsGranularity)
    granularity: AnalyticsGranularity;

    // format: yyyy-mm-dd
    @IsDefined()
    @IsString()
    start_date: string;

    // format: yyyy-mm-dd
    @IsDefined()
    @IsString()
    end_date: string;
}
