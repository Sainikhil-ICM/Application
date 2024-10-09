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

// {
//     "Trade Date": "02/21/2024",
//     product: "mld2",
//     productType: "mld",
//     Price: 120000,
//     "Settlement Date": "02/22/2024",
//     remainingPrincipalPerc: 100,
//     units: 1,
//     futureCoupons: [
//     ],
//     ytm: null,
//     userAmount: 120000,
//     offerBenefit: null,
//     xirrBenefit: 0,
//     totalAmountAtMaturity: null,
//     withBenefit: {
//       units: 0,
//       ytm: null,
//       userAmount: 0,
//     },
//     withoutBenefit: {
//       units: 1,
//       ytm: null,
//       userAmount: 120000,
//     },
//     referralBenefits: null,
//   }

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
