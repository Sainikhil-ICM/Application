import { Customer } from 'src/models/customer.model';

export class CreateCustomerDto {
    First_Name: string;
    Last_Name: string;
    Email: string;

    constructor(params: Partial<Customer>) {
        this.First_Name = params.name;
        this.Last_Name = params.name;
        this.Email = params.email;
    }
}
