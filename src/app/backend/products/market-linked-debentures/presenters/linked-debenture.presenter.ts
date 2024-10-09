import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LinkedDebenturePresenter {
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

    @Expose({ name: 'xirr_price_for_user' })
    xirrPriceForUser: boolean;

    constructor(partial: Partial<LinkedDebenturePresenter>) {
        Object.assign(this, partial);
    }
}

//     desc_logo_url: z.string(),
//     why_invest_0: z.string(),
//     why_invest_1: z.string().optional(),
//     why_invest_2: z.string().optional(),
//     why_invest_3: z.string().optional(),
//     why_invest_4: z.string().optional(),
//     why_invest_5: z.string().optional(),
//     xirr_price_for_user: z.boolean(),
//     face_value: z.string(),
//     profit_after_tax: z.string(),
//     nnpa: z.string(),
//     market_start_time: z.string(),
//     market_end_time: z.string(),
//     aum: z.string(),
//     interest_payout: z.string(),
//     max_tenure: z.number(),
//     min_tenure: z.number(),
//     prospectus_link: z.string(),
//     wa_media_url: z.string(),
//     security_cover: z.string(),
//     equity_ratio: z.string(),
//     tds: z.string(),
//     display_name: z.string(),
//     tax_saving: z.string(),
//     is_active: z.string(),
//     market_cap: z.string(),
//     marketing_gif_banner: z.string(),
//     multiplier: z.number(),
//     order: z.number(),
//     networth: z.string(),
//     sold_out_text: z.string(),
//     true_isin: z.string(),
//     exit_load: z.number(),
//     gnpa: z.string(),
//     issuer_face_value: z.number().optional(),
//     product_info_memorandum: z.string(),
//     highlight_points: z.string(),
//     highlight_points_0: z.string(),
//     highlight_points_2: z.string().optional(),
//     highlight_points_1: z.string().optional(),
//     highlight_points_3: z.string().optional(),
//     highlight_points_4: z.string().optional(),
//     highlight_points_5: z.string().optional(),
//     lender_icons: z.string(),
//     lender_icons_0: z.string(),
//     lender_icons_1: z.string().optional(),
//     lender_icons_2: z.string().optional(),
//     lender_icons_3: z.string().optional(),
//     lender_icons_4: z.string().optional(),
//     lender_icons_5: z.string().optional(),
//     template_id: z.string(),
//     cnn: z.string(),
//     debenture_trustee: z.string(),
//     depository: z.string(),
//     expiry_in_days: z.number(),
//     message: z.string(),
//     mode_of_issue: z.string(),
//     security_details: z.string(),
//     seller_client_id: z.string(),
//     seller_despository: z.string(),
//     seller_dp_id: z.string(),
//     seller_dp_name: z.string(),
//     seller_name: z.string(),
//     seller_signature: z.string(),
