export class CheckoutCartDto {
    bankId: string;
    paymentType: string;
    utrn: string;
    pan: string;
    platform: string;
    subBrokerCode: string;

    constructor(params: { pan_number: string; bank_id: string; payment_mode: string; ifa_code }) {
        this.bankId = params.bank_id;
        this.paymentType = params.payment_mode;
        this.utrn = null;
        this.pan = params.pan_number;
        this.platform = 'web';
        this.subBrokerCode = params.ifa_code;
    }
}
