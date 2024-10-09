type CreateOrderDmoProps = {
    product_isin: string;
    units: number;
    trade_date: string;
    product_code: string;
    access_token: string;
    account_code: string;
    price_deviation: number;
};

export class CreateOrderDmo {
    units: number;
    tradeDate: string;
    priceDeviation: number;
    txnType: string;
    subPartner: string;
    productIsin: string;
    productCode: string;
    accountCode: string;
    accessToken: string;

    constructor(params: CreateOrderDmoProps) {
        this.units = params.units;
        this.tradeDate = params.trade_date;
        this.priceDeviation = params.price_deviation;
        this.txnType = 'purchase';
        this.subPartner = 'BOND007';
        this.productIsin = params.product_isin;
        this.productCode = params.product_code;
        this.accountCode = params.account_code;
        this.accessToken = params.access_token;
    }
}

export type CreateOrderResp = {
    orderId: string;
    updatedAt: number;
    status: string;
    pgDetails: {
        redirectUrl: string;
    };
};
