import { Exclude, Expose, Transform } from 'class-transformer';

import { GetPriceResp } from 'src/services/listed-bond/dto/get-price.dto';

@Exclude()
export class ListedBondPricePresenter {
    @Expose({ name: 'trade_date' })
    'Trade Date': string;

    @Expose({ name: 'product' })
    product: string;

    @Expose({ name: 'product_type' })
    productType: string;

    @Expose({ name: 'price' })
    Price: number;

    @Expose({ name: 'settlement_date' })
    'Settlement Date': string;

    @Expose({ name: 'next_coupon_date' })
    nextCouponDate: string;

    @Expose({ name: 'remaining_principal_perc' })
    remainingPrincipalPerc: number;

    @Expose({ name: 'ytm' })
    ytm: number;

    @Expose({ name: 'units' })
    units: number;

    @Expose({ name: 'user_amt' })
    userAmount: number;

    @Expose({ name: 'offer_benefit' })
    offerBenefit: number;

    @Expose({ name: 'total_amt_at_maturity' })
    totalAmountAtMaturity: number;

    @Expose({ name: 'referral_benefits' })
    referralBenefits: number | null;

    @Expose({ name: 'xirr_benefit' })
    xirrBenefit: number;

    @Expose({ name: 'accrued_interest' })
    accruedInterest: number;

    @Expose({ name: 'without_benefit' })
    @Transform(({ value }) => ({
        trade_date: value['Trade Date'],
        product: value['product'],
        product_type: value['productType'],
        price: value['Price'],
        settlement_date: value['Settlement Date'],
        next_coupon_date: value['nextCouponDate'],
        remaining_principal_perc: value['remainingPrincipalPerc'],
        ytm: value['ytm'],
        units: value['units'],
        user_amt: value['userAmount'],
        xirr_benefit: value['xirrBenefit'],
        offer_benefit: value['offerBenefit'],
        total_amt_at_maturity: value['totalAmountAtMaturity'],
    }))
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

    @Expose({ name: 'with_benefit' })
    @Transform(({ value }) => ({
        trade_date: value['Trade Date'],
        product: value['product'],
        product_type: value['productType'],
        price: value['Price'],
        settlement_date: value['Settlement Date'],
        next_coupon_date: value['nextCouponDate'],
        remaining_principal_perc: value['remainingPrincipalPerc'],
        ytm: value['ytm'],
        units: value['units'],
        user_amt: value['userAmount'],
        xirr_benefit: value['xirrBenefit'],
        offer_benefit: value['offerBenefit'],
        total_amt_at_maturity: value['totalAmountAtMaturity'],
    }))
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

    constructor(partial: Partial<GetPriceResp>) {
        Object.assign(this, partial);
    }
}
