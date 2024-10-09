type AkycSubmitEventProps = {
    customer_id: string;
    customerName: string;
    rmName: string;
    email: string;
};

export class AkycSubmitEvent {
    customer_id: string;
    customerName: string;
    rmName: string;
    email: string;

    constructor(params: AkycSubmitEventProps) {
        Object.assign(this, params);
    }
}
