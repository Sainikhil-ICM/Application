import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/product.module';

@Module({
    imports: [ProductsModule, CustomersModule],
})
export class InvestorModule {}
