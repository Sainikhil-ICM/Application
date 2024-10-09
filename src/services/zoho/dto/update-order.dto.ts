import { Payment } from 'src/models/payment.model';

export class UpdateOrderDto {
    Id: string;
    Status: string;

    constructor(params: Partial<Payment>) {
        this.Id = params.zoho_id;
        this.Status = params.status;
    }
}
