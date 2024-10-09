type GetPaymentLinkDmoProps = {
    order_id: string;
    pan_number: string;
    email: string;
    access_token: string;
};

export class GetPaymentLinkDmo {
    Platform: string;
    orderId: string;
    pan: string;
    email: string;
    accessToken: string;

    constructor(params: GetPaymentLinkDmoProps) {
        this.Platform = 'web';
        this.orderId = params.order_id;
        this.pan = params.pan_number;
        this.email = params.email;
        this.accessToken = params.access_token;
    }
}

export type GetPaymentLinkResp = {
    docId: string;
    eSigningUrl: string;
};
