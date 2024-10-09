type FutureCoupon = {
    productType: string;
    product: string;
    'Payment Dates': string;
    CouponPer1k: number;
    justCoupon: number;
    principalPayoutAmount: number;
    principalPayoutPerc: number;
    cutOffDate: string;
};

export type GetPriceResp = {
    futureCoupons: FutureCoupon[];
    'Trade Date': string;
    product: string;
    productType: string;
    Price: number;
    'Settlement Date': string;
    nextCouponDate: string;
    remainingPrincipalPerc: number;
    ytm: number;
    units: number;
    userAmount: number;
    offerBenefit: number;
    totalAmountAtMaturity: number;
    withBenefit: {
        'Trade Date': string;
        product: string;
        productType: string;
        Price: number;
        'Settlement Date': string;
        nextCouponDate: string;
        remainingPrincipalPerc: number;
        ytm: number;
        units: number;
        userAmount: number;
        xirrBenefit: number;
        offerBenefit: number;
        totalAmountAtMaturity: number;
    };
    withoutBenefit: {
        'Trade Date': string;
        product: string;
        productType: string;
        Price: number;
        'Settlement Date': string;
        nextCouponDate: string;
        remainingPrincipalPerc: number;
        ytm: number;
        units: number;
        userAmount: number;
        xirrBenefit: number;
        offerBenefit: number;
        totalAmountAtMaturity: number;
    };
    referralBenefits: null;
    xirrBenefit: number;
    accruedInterest: number;
};
