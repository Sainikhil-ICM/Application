import { Exclude, Expose, Transform } from 'class-transformer';
import { GetProductResp } from 'src/services/listed-bond/dto/get-product.dto';

@Exclude()
export class ListedBondAssetPresenter {
    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'aum' })
    aum: string;

    @Expose({ name: 'base_xirr' })
    baseXirr: string;

    @Expose({ name: 'bond_id' })
    bondId: string;

    @Expose({ name: 'category' })
    category: string;

    @Expose({ name: 'comms' })
    @Transform(({ value }) => ({
        wa_media_url: value.waMediaURL,
    }))
    comms: {
        wa_media_url: string;
    };

    @Expose({ name: 'coupon_rate' })
    couponRate: number;

    @Expose({ name: 'coupon_type' })
    couponType: string;

    @Expose({ name: 'desc_logo_url' })
    descLogoUrl: string;

    @Expose({ name: 'description' })
    description: string;

    @Expose({ name: 'digio' })
    @Transform(({ value }) => ({
        sellerSignatureText: value.seller_signature_text,
        sellerName: value.seller_name,
        sellerDpName: value.seller_dp_name,
        sellerDpID: value.seller_dp_id,
        sellerClientId: value.seller_client_id,
        securityDetails: value.security_details,
        modeOfIssue: value.mode_of_issue,
        message: value.message,
        issuer: value.issuer,
        expiryInDays: value.expiry_in_days,
        depository: value.depository,
        sellerDepository: value.seller_depository,
        templateId: value.template_id,
        cin: value.cin,
        debentureTrustee: value.debenture_trustee,
    }))
    digio: {
        sellerSignatureText: string;
        sellerName: string;
        sellerDpName: string;
        sellerDpID: string;
        sellerClientId: string;
        securityDetails: string;
        modeOfIssue: string;
        message: string;
        issuer: string;
        expiryInDays: number;
        depository: string;
        sellerDepository: string;
        templateId: string;
        cin: string;
        debentureTrustee: string;
    };

    @Expose({ name: 'display_name' })
    displayName: string;

    @Expose({ name: 'exit_load_in_perc' })
    exitLoadInPerc: number;

    @Expose({ name: 'face_value' })
    faceValue: number;

    @Expose({ name: 'fund_id' })
    fundId: string;

    @Expose({ name: 'gnpa' })
    gnpa: string;

    @Expose({ name: 'highlights' })
    @Transform(({ value }) =>
        value.map((item: any) => ({
            web: item.web,
            text: item.text,
        })),
    )
    highlights: Array<{
        web: string;
        text: string;
    }>;

    @Expose({ name: 'is_active' })
    isActive: boolean;

    @Expose({ name: 'issue_category' })
    issueCategory: string;

    @Expose({ name: 'issue_date' })
    issueDate: string;

    @Expose({ name: 'issue_price' })
    issuePrice: number;

    @Expose({ name: 'issue_size' })
    issueSize: number;

    @Expose({ name: 'issue_type' })
    issueType: string;

    @Expose({ name: 'issuer' })
    issuer: string;

    @Expose({ name: 'issuer_face_value' })
    issuerFaceValue: number;

    @Expose({ name: 'lender_icons' })
    lenderIcons: Array<any>;

    @Expose({ name: 'listing' })
    listing: string;

    @Expose({ name: 'listing_category' })
    listingCategory: string;

    @Expose({ name: 'listing_type' })
    listingType: string;

    @Expose({ name: 'logo_url' })
    logoUrl: string;

    @Expose({ name: 'maturity_date' })
    maturityDate: string;

    @Expose({ name: 'max_amt' })
    maxAmt: number;

    @Expose({ name: 'max_returns' })
    maxReturns: number;

    @Expose({ name: 'max_tenure' })
    maxTenure: number;

    @Expose({ name: 'max_xirr_deviation' })
    maxXirrDeviation: string;

    @Expose({ name: 'min_amt' })
    minAmt: number;

    @Expose({ name: 'min_returns' })
    minReturns: number;

    @Expose({ name: 'min_tenure' })
    minTenure: number;

    @Expose({ name: 'min_units' })
    minUnits: number;

    @Expose({ name: 'min_xirr_deviation' })
    minXirrDeviation: string;

    @Expose({ name: 'multiplier' })
    multiplier: number;

    @Expose({ name: 'net_worth' })
    netWorth: string;

    @Expose({ name: 'open_date' })
    openDate: string;

    @Expose({ name: 'order' })
    order: number;

    @Expose({ name: 'price_is_live' })
    priceIsLive: boolean;

    @Expose({ name: 'principal_repayment' })
    principalRepayment: string;

    @Expose({ name: 'product' })
    product: string;

    @Expose({ name: 'product_name' })
    productName: string;

    @Expose({ name: 'product_type' })
    productType: string;

    @Expose({ name: 'profit_after_tax' })
    profitAfterTax: string;

    @Expose({ name: 'rating' })
    rating: string;

    @Expose({ name: 'sale_tag' })
    saleTag: string | null;

    @Expose({ name: 'security_cover' })
    securityCover: string;

    @Expose({ name: 'sold_out_txt' })
    soldOutTxt: string;

    @Expose({ name: 'step_size' })
    stepSize: number;

    @Expose({ name: 'tag_line' })
    tagLine: string;

    @Expose({ name: 'tax_saving' })
    taxSaving: string;

    @Expose({ name: 'tds' })
    tds: number;

    @Expose({ name: 'true_isin' })
    trueIsin: string;

    @Expose({ name: 'why_invest' })
    whyInvest: string;

    @Expose({ name: 'xirr' })
    xirr: string;

    @Expose({ name: 'xirr_price_for_user' })
    xirrPriceForUser: boolean;

    @Expose({ name: 'close_date' })
    closeDate: string;

    @Expose({ name: 'company_financials_link' })
    companyFinancialsLink: string;

    @Expose({ name: 'company_presentation_link' })
    companyPresentationLink: string;

    @Expose({ name: 'debt_equity_ratio' })
    debtEquityRatio: string;

    @Expose({ name: 'market_cap' })
    marketCap: string;

    @Expose({ name: 'market_end_time' })
    marketEndTime: string;

    @Expose({ name: 'market_start_time' })
    marketStartTime: string;

    @Expose({ name: 'marketing_gif_banner' })
    marketingGifBanner: string;

    @Expose({ name: 'nnpa' })
    nnpa: string;

    @Expose({ name: 'product_info_memorandum' })
    productInfoMemorandum: string;

    @Expose({ name: 'prospectus_link' })
    prospectusLink: string;

    @Expose({ name: 'rating_rationale_url' })
    ratingRationaleUrl: string;

    @Expose({ name: 'show_on_browse' })
    showOnBrowse: boolean;

    @Expose({ name: 'is_txn_allowed' })
    isTxnAllowed: boolean;

    @Expose({ name: 'show_on_mobile' })
    showOnMobile: boolean;

    constructor(partial: Partial<GetProductResp>) {
        Object.assign(this, partial);
    }
}
