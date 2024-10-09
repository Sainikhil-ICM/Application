import { CustomerDocument } from 'src/models/customer.model';

export class CustomerUccCreationEvent {
    id: string;
    email: string;

    constructor(params: CustomerDocument) {
        Object.assign(this, params.toJSON());
    }
}
