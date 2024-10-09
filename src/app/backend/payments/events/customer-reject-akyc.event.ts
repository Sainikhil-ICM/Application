type CustomerAkycRejectEventSchema = {
    customer_name: string;
    rm_email: string;
    discrepency: string;
};

export class CustomerAkycRejectEvent {
    customer_name: string;
    rm_email: string;
    discrepency: string;

    constructor(params: CustomerAkycRejectEventSchema) {
        Object.assign(this, params);
    }
}
