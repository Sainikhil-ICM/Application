import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MutualFundPresenter {
    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'category' })
    category: string;

    @Expose({ name: 'max_amt' })
    maxAmt: number;

    @Expose({ name: 'max_price_deviation' })
    maxPriceDeviation: number;

    @Expose({ name: 'max_units' })
    maxUnits: number;

    @Expose({ name: 'debt_to_equity_ratio' })
    debtToEquityRatio: string;

    @Expose({ name: 'book_value' })
    bookValue: string;

    @Expose({ name: 'is_available' })
    isProductAvailable: boolean;

    @Expose({ name: 'min_price_deviation' })
    minPriceDeviation: number;

    @Expose({ name: 'min_units' })
    minUnits: number;

    @Expose({ name: 'price_step_size' })
    priceStepSize: number;

    @Expose({ name: 'product' })
    product: string;

    @Expose({ name: 'company' })
    company: any;

    @Expose({ name: 'digio' })
    digio: any;

    @Expose({ name: 'price' })
    price: any;

    @Expose({ name: 'strengths' })
    strengths: string[];

    @Expose({ name: 'weaknesses' })
    weaknesses: string[];

    @Expose({ name: 'distribution' })
    distribution: any;

    @Expose({ name: 'listing_type' })
    listingType: string;

    @Expose({ name: 'step_size' })
    stepSize: number;

    @Expose({ name: 'updated_at' })
    updatedAt: number;

    constructor(partial: Partial<MutualFundPresenter>) {
        Object.assign(this, partial);
    }
}
