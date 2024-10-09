import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UnlistedEquityPricePresenter {
    @Expose({ name: 'units' })
    units: number;

    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'trade_date' })
    tradeDate: string;

    @Expose({ name: 'settlement_date' })
    settlementDate: string;

    @Expose({ name: 'date' })
    date: string;

    @Expose({ name: 'unit_price' })
    unitPrice: number;

    @Expose({ name: 'amount' })
    amount: number;

    @Expose({ name: 'price_deviation' })
    priceDeviation: number;

    @Expose({ name: 'benefits' })
    @Transform(({ obj: { benefits } }) => ({
        total: {
            discount_perc: benefits.total.discountPerc,
            discount_amount: benefits.total.discountAmount,
            with_benefit_amount: benefits.total.withBenefitAmount,
            user_amount: benefits.total.userAmount,
        },
    }))
    benefits: {
        total: {
            discountPerc: number;
            discountAmount: number;
            withBenefitAmount: number;
            userAmount: number;
        };
    };

    constructor(partial: Partial<UnlistedEquityPricePresenter>) {
        Object.assign(this, partial);
    }
}
