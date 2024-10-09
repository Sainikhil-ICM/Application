import { Exclude, Expose } from 'class-transformer';

export class ProductResDto {
    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'bond_id' })
    bondId: string;

    product: string;

    @Expose({ name: 'name' })
    productName: string;

    @Expose({ name: 'type' })
    productType: string;

    @Exclude()
    tagLine: string;

    @Exclude()
    comms: string;

    @Exclude()
    debtEquityRatio: string;

    @Exclude()
    descLogoUrl: string;

    @Exclude()
    digio: string;

    @Exclude()
    lenderIcons: string;

    @Exclude()
    marketCap: string;

    @Exclude()
    marketingGifBanner: string;

    @Exclude()
    productInfoMemorandum: string;

    @Exclude()
    profitAfterTax: string;

    @Exclude()
    prospectusLink: string;

    description: string;

    @Expose({ name: 'why_invest' })
    whyInvest: string;

    @Expose({ name: 'show_on_mobile' })
    showOnMobile: boolean;

    @Expose({ name: 'is_txn_allowed' })
    isTxnAllowed: boolean;

    @Expose({ name: 'show_on_browse' })
    showOnBrowse: boolean;

    @Expose({ name: 'min_xirr_deviation' })
    minXirrDeviation: string;

    @Expose({ name: 'max_xirr_deviation' })
    maxXirrDeviation: string;

    @Expose({ name: 'base_xirr' })
    baseXirr: string;

    @Expose({ name: 'xirr_price_for_user' })
    xirrPriceForUser: boolean;

    @Expose({ name: 'true_isin' })
    trueISIN: string;

    @Expose({ name: 'tax_saving' })
    taxSaving: string;

    @Expose({ name: 'security_cover' })
    securityCover: string;

    @Expose({ name: 'max_tenure' })
    maxTenure: number;

    @Expose({ name: 'min_tenure' })
    minTenure: number;

    tds: number;

    multiplier: number;

    @Expose({ name: 'net_worth' })
    netWorth: string;

    @Expose({ name: 'price_is_live' })
    priceIsLive: boolean;

    @Expose({ name: 'exit_load_in_perc' })
    exitLoadInPerc: number;

    @Expose({ name: 'market_end_time' })
    marketEndTime: string;

    @Expose({ name: 'market_start_time' })
    marketStartTime: string;

    @Expose({ name: 'face_value' })
    faceValue: number;

    @Expose({ name: 'fund_id' })
    fundId: string;

    @Expose({ name: 'display_name' })
    displayName: string;

    @Expose({ name: 'is_active' })
    isActive: string;

    @Expose({ name: 'logo' })
    logoUrl: string;

    @Expose({ name: 'maturity_date' })
    maturityDate: Date;

    @Expose({ name: 'open_date' })
    openDate: Date;

    @Expose({ name: 'close_date' })
    closeDate: Date;

    @Expose({ name: 'min_amount' })
    minAmt: number;

    @Expose({ name: 'min_units' })
    minUnits: number;

    @Expose({ name: 'max_amount' })
    maxAmt: number;

    @Expose({ name: 'return_rate' })
    return_rate: number;

    @Expose({ name: 'principal_repayment' })
    principalRepayment: string;

    @Expose({ name: 'coupon_type' })
    couponType: number;

    @Expose({ name: 'listing' })
    listing: string;

    @Expose({ name: 'rating' })
    rating: string;

    @Exclude()
    ratingRationaleUrl: string;

    @Expose({ name: 'category' })
    category: string;

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

    @Exclude()
    companyFinancialsLink: string;

    @Exclude()
    companyPresentationLink: string;

    @Expose({ name: 'coupon_rate' })
    couponRate: number;

    @Expose({ name: 'max_returns' })
    maxReturns: number;

    @Expose({ name: 'min_returns' })
    minReturns: number;

    @Exclude()
    soldOutTxt: string;

    @Expose({ name: 'step_size' })
    stepSize: number;

    @Expose({ name: 'series' })
    series: any;

    constructor(partial: Partial<ProductResDto>) {
        Object.assign(this, partial);
    }
}
