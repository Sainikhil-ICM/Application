export class RedeemCartDto {
    bankAccountNumber: string;
    bankId: string | undefined;
    paymentType: string;
    utrn: string;
    pan: string;
    platform: string;
    subBrokerCode: string;

    constructor(params: {
        pan_number: string;
        account_number: string;
        ifa_code: string;
        bank_id?: string;
    }) {
        this.bankAccountNumber = params.account_number;
        this.paymentType = 'netbanking';
        this.utrn = null;
        this.pan = params.pan_number;
        this.platform = 'web';
        this.subBrokerCode = params.ifa_code;
        this.bankId = params.bank_id;
    }
}
