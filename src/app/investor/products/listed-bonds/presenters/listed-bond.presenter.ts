import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ListedBondPresenter {
    @Expose({ name: 'id' })
    id: string;

    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'bond_id' })
    bondId: string;

    @Expose({ name: 'product' })
    product: string;

    @Expose({ name: 'product_name' })
    productName: string;

    @Expose({ name: 'product_type' })
    productType: string;

    @Expose({ name: 'base_xirr' })
    baseXirr: string;

    @Expose({ name: 'tag_line' })
    tagLine: string;

    @Expose({ name: 'description' })
    description: string;

    @Expose({ name: 'logo_url' })
    logoUrl: string;

    @Expose({ name: 'maturity_date' })
    maturityDate: Date;

    @Expose({ name: 'open_date' })
    openDate: Date;

    @Expose({ name: 'close_date' })
    closeDate: Date;

    @Expose({ name: 'min_amt' })
    minAmt: number;

    @Expose({ name: 'min_units' })
    minUnits: number;

    @Expose({ name: 'max_amt' })
    maxAmt: number;

    @Expose({ name: 'xirr' })
    xirr: number;

    @Expose({ name: 'principal_repayment' })
    principalRepayment: string;

    @Expose({ name: 'coupon_type' })
    couponType: number;

    @Expose({ name: 'listing' })
    listing: string;

    @Expose({ name: 'rating' })
    rating: string;

    @Expose({ name: 'rating_rationale_url' })
    ratingRationaleUrl: string;

    @Expose({ name: 'category' })
    category: string;

    @Expose({ name: 'why_invest' })
    whyInvest: string;

    @Expose({ name: 'issue_category' })
    issueCategory: string;

    @Expose({ name: 'issue_type' })
    issueType: string;

    @Expose({ name: 'listing_type' })
    listingType: string;

    @Expose({ name: 'issue_size' })
    issueSize: number;

    @Expose({ name: 'issue_price' })
    issuePrice: number;

    @Expose({ name: 'issue_date' })
    issueDate: Date;

    @Expose({ name: 'issuer' })
    issuer: string;

    @Expose({ name: 'company_financials_link' })
    companyFinancialsLink: string;

    @Expose({ name: 'company_presentation_link' })
    companyPresentationLink: string;

    @Expose({ name: 'coupon_rate' })
    couponRate: number;

    @Expose({ name: 'max_returns' })
    maxReturns: number;

    @Expose({ name: 'min_returns' })
    minReturns: number;

    @Expose({ name: 'max_xirr_deviation' })
    maxXirrDeviation: string;

    @Expose({ name: 'min_xirr_deviation' })
    minXirrDeviation: string;

    @Expose({ name: 'sold_out_txt' })
    soldOutTxt: string;

    @Expose({ name: 'step_size' })
    stepSize: number;

    @Expose({ name: 'series' })
    series: any;

    @Expose({ name: 'listing_category' })
    listingCategory: string;

    constructor(partial: Partial<ListedBondPresenter>) {
        Object.assign(this, partial);
    }
}
