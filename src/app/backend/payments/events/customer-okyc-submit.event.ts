type CustomerOkycSubmitEventSchema = {
    id: string;
    email: string;
    kyc_form?: ArrayBuffer;
    attachment_name: string;
    name: string;
};

export class CustomerOkycSubmitEvent {
    id: string;
    email: string;
    kyc_form?: ArrayBuffer;
    attachment_name: string;
    name: string;

    constructor(params: CustomerOkycSubmitEventSchema) {
        Object.assign(this, params);
    }
}
