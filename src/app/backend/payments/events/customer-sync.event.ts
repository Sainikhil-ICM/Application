import { CustomerDocument } from 'src/models/customer.model';

export class CustomerSyncEvent {
    id: string;
    access_token: string;

    constructor(params: CustomerDocument) {
        Object.assign(this, params.toJSON());
    }
}
