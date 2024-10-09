import { Module } from '@nestjs/common';

import { ListedBondsModule } from './listed-bonds/listed-bonds.module';
import { MutualFundsModule } from './mutual-funds/mutual-funds.module';
import { UnlistedEquitiesModule } from './unlisted-equities/unlisted-equities.module';

@Module({
    imports: [ListedBondsModule, MutualFundsModule, UnlistedEquitiesModule],
})
export class ProductsModule {}
