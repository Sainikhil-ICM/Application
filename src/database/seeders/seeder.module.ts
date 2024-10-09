import { Module } from '@nestjs/common';
import { CustomersSeederModule } from './customers/customers.seeder.module';
import { SeederService } from './seeder.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from 'config';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['env/.env.prod'],
            load: configuration,
            expandVariables: true,
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('DATABASE.url'),
            }),
            inject: [ConfigService],
        }),
        CustomersSeederModule,
    ],
    providers: [SeederService],
})
export class SeederModule {}
