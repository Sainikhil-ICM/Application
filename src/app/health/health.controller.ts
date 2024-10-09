import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    HealthCheckService,
    HttpHealthIndicator,
    HealthCheck,
    MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private readonly configService: ConfigService,
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private mongoose: MongooseHealthIndicator,
    ) {}

    appBaseUrl = this.configService.get<string>('APP_URL');

    @Get()
    @HealthCheck()
    checkStatus() {
        return this.health.check([
            async () => this.mongoose.pingCheck('database', { timeout: 300 }),
            () =>
                this.http.pingCheck('listed-bonds', `${this.appBaseUrl}/v1/listed-bonds/products`),
            () =>
                this.http.pingCheck(
                    'unlisted-equities',
                    `${this.appBaseUrl}/v1/unlisted-equities/products`,
                ),
        ]);
    }
}
