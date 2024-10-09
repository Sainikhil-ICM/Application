type GetTransactionsDmoProps = {
    product_isin: string;
    product_code: string;
    order_id: string;
    access_token: string;
};

export class GetTransactionsDmo {
    productIsin: string;
    productCode: string;
    orderId: string;
    accessToken: string;

    constructor(params: GetTransactionsDmoProps) {
        this.productIsin = params.product_isin;
        this.productCode = params.product_code;
        this.orderId = params.order_id;
        this.accessToken = params.access_token;
    }
}

export type GetTransactionsResp = [
    {
        orderId: string;
        status: string;
        txnId: string;
        adminStatus: string;
    },
];
