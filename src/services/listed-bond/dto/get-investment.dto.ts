type GetInvestmentDtoProps = {
    unit_price: number;
    product_code: string;
    units: number;
    return_rate: number;
    access_token: string;
};

export class GetInvestmentDto {
    amount: number;
    product: string;
    units: number;
    expectedXirr: number;
    accessToken: string;

    constructor(params: GetInvestmentDtoProps) {
        this.amount = params.unit_price;
        this.product = params.product_code;
        this.units = params.units;
        this.expectedXirr = params.return_rate;
        this.accessToken = params.access_token;
    }
}

export type GetInvestmentResp = {
    userAmount: number;
};
