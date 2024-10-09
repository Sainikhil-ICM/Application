import { Module } from '@nestjs/common';
import { MutualFundsService } from './mutual-funds.service';
import { MutualFundsController } from './mutual-funds.controller';

@Module({
    controllers: [MutualFundsController],
    providers: [MutualFundsService],
})
export class MutualFundsModule {}
