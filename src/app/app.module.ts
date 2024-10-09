import configuration from 'config';
import * as mongoose from 'mongoose';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DocsModule } from './docs/docs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { PartnerModule } from './partner/partner.module';
import { BackendModule } from './backend/backend.module';
import { InvestorModule } from './investor/investor.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestInterceptor } from 'src/interceptors/request.interceptor';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env.prod', '.env.icvp_prod', '.env.india', '.env.uat', '.env'],
            load: configuration,
            expandVariables: true,
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                mongoose.plugin(require('mongoose-lean-virtuals'));

                return {
                    uri: configService.get<string>('DATABASE.url'),
                };
            },
            inject: [ConfigService],
        }),
        HealthModule,
        PartnerModule,
        BackendModule,
        DocsModule,
        InvestorModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestInterceptor,
        },
    ],
})
export class AppModule {}
