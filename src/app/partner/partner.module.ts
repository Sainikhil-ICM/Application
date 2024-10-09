import { Module } from '@nestjs/common';
import { CustomersModule } from './customers/customers.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';

@Module({
    imports: [CustomersModule, PaymentsModule, ProductsModule],
})
export class PartnerModule {}
