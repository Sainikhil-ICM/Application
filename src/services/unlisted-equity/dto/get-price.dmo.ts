type GetPriceDmoProps = {
    isin: string;
    trade_date: string;
    units: number;
};

export class GetPriceDmo {
    isin: string;
    tradeDate: string;
    units: number;

    constructor(params: GetPriceDmoProps) {
        this.isin = params.isin;
        this.tradeDate = params.trade_date;
        this.units = params.units;
    }
}

export type GetPriceResp = {
    unitPrice: number;
    minPriceDeviation: number;
    maxPriceDeviation: number;
};
