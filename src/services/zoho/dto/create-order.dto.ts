import { Payment } from 'src/models/payment.model';

export class CreateOrderDto {
    Status: string;

    constructor(params: Partial<Payment>) {
        this.Status = params.status;
    }
}
