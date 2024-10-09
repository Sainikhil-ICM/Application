import { Module } from '@nestjs/common';
import { UnlistedEquitiesService } from './unlisted-equities.service';
import { UnlistedEquitiesController } from './unlisted-equities.controller';

@Module({
    controllers: [UnlistedEquitiesController],
    providers: [UnlistedEquitiesService],
})
export class UnlistedEquitiesModule {}
