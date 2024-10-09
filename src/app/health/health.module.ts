import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

/**
 * https://github.com/nestjs/terminus
 * https://docs.nestjs.com/recipes/terminus
 * https://github.dev/nestjs/terminus/tree/master/sample
 */
@Module({
    controllers: [HealthController],
    imports: [TerminusModule, HttpModule],
})
export class HealthModule {}
