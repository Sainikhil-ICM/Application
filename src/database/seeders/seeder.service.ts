import { Injectable } from '@nestjs/common';
import { CustomersSeederService } from './customers/customers.seeder.service';

@Injectable()
export class SeederService {
    constructor(private readonly customerSeederService: CustomersSeederService) {}

    async seedCustomers() {
        return this.customerSeederService.seedCustomers();
    }

    async syncCustomers() {
        return this.customerSeederService.syncCustomers();
    }
}
