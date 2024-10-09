import { Lead } from 'src/models/lead.model';

export class LeadCreateEvent {
    id: string;
    name: string;
    email: string;
    product_isin: string;

    constructor(params: Partial<Lead>) {
        Object.assign(this, params);
    }
}
