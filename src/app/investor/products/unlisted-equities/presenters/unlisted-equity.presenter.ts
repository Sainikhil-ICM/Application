import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UnlistedEquityPresenter {
    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'annual_reports' })
    @Transform(({ obj: { annualReports } }) => ({
        fiscal_years: annualReports.fiscalYears,
        data: annualReports.data,
    }))
    annualReports: {
        fiscalYears: string[];
        data: Array<{
            title: string;
            values: string[];
        }>;
    };

    @Expose({ name: 'board_of_directors' })
    @Transform(({ value }) =>
        (value || []).map((director: any = {}) => ({
            full_name: director.fullName,
            designation: director.designation,
        })),
    )
    boardOfDirectors: Array<{
        fullName: string;
        designation: string;
    }>;

    @Expose({ name: 'book_value' })
    bookValue: string;

    @Expose({ name: 'category' })
    category: string;

    @Expose({ name: 'company' })
    @Transform(({ obj: { company } }) => ({
        description: company.description,
        overview: company.overview,
        sector: company.sector,
        logo_url: company.logoUrl,
        why_invest: company.whyInvest,
        display_name: company.displayName,
        share_holding_pattern: (company.shareHoldingPattern || []).map((holder: any) => ({
            share_holder: holder.shareHolder,
            percentage: holder.percentage,
        })),
        corporate_actions: company.corporateActions,
    }))
    company: {
        description: string;
        overview: string;
        sector: string;
        logoUrl: string;
        whyInvest: string;
        displayName: string;
        shareHoldingPattern: Array<{
            shareHolder: string;
            percentage: string;
        }>;
        corporateActions: Array<{
            action: string;
        }>;
    };

    @Expose({ name: 'company_financials' })
    @Transform(({ obj: { companyFinancials } }) => ({
        fiscal_years: companyFinancials.fiscalYears,
        data: companyFinancials.data,
    }))
    companyFinancials: {
        fiscalYears: string[];
        data: Array<{
            title: string;
            values: string[];
        }>;
    };

    @Expose({ name: 'company_presentations' })
    @Transform(({ obj: { companyPresentations } }) => ({
        fiscal_years: companyPresentations.fiscalYears,
        data: companyPresentations.data,
    }))
    companyPresentations: {
        fiscalYears: string[];
        data: any[];
    };

    @Expose({ name: 'company_ratings' })
    @Transform(({ obj: { companyRatings } }) => ({
        fiscal_years: companyRatings.fiscalYears,
        data: companyRatings.data,
    }))
    companyRatings: {
        fiscalYears: string[];
        data: any[];
    };

    @Expose({ name: 'debt_to_equity_ratio' })
    debtToEquityRatio: string;

    @Expose({ name: 'distribution' })
    @Transform(({ obj: { distribution } }) => ({
        face_value: distribution.faceValue,
        profit_after_tax: distribution.profitAfterTax,
        earnings_per_share: distribution.earningsPerShare,
        share_capital: distribution.shareCapital,
        sales: distribution.sales,
        market_cap: distribution.marketCap,
        dividend_yield: distribution.dividendYield,
        price_to_earnings_ratio: distribution.priceToEarningsRatio,
        price_to_sales_ratio: distribution.priceToSalesRatio,
        price_to_book_ratio: distribution.priceToBookRatio,
        industry_pe: distribution.industryPE,
    }))
    distribution: {
        faceValue: number;
        profitAfterTax: string;
        earningsPerShare: string;
        shareCapital: string;
        sales: string;
        marketCap: string;
        dividendYield: string;
        priceToEarningsRatio: string;
        priceToSalesRatio: string;
        priceToBookRatio: string;
        industryPE: string;
    };

    @Expose({ name: 'is_active' })
    isActive: boolean;

    @Expose({ name: 'listing_type' })
    listingType: string;

    @Expose({ name: 'max_amt' })
    maxAmt: number;

    @Expose({ name: 'max_price_deviation' })
    maxPriceDeviation: number;

    @Expose({ name: 'max_units' })
    maxUnits: number;

    @Expose({ name: 'min_price_deviation' })
    minPriceDeviation: number;

    @Expose({ name: 'min_units' })
    minUnits: number;

    @Expose({ name: 'price_step_size' })
    priceStepSize: number;

    @Expose({ name: 'product' })
    product: string;

    @Expose({ name: 'product_type' })
    productType: string;

    @Expose({ name: 'profit_and_loss_table' })
    @Transform(({ obj: { profitAndLossTable } }) => ({
        fiscal_years: profitAndLossTable.fiscalYears,
        data: profitAndLossTable.data,
    }))
    profitAndLossTable: {
        fiscalYears: string[];
        data: Array<{
            title: string;
            values: string[];
        }>;
    };

    @Expose({ name: 'research_report' })
    researchReport: string;

    @Expose({ name: 'senior_management' })
    @Transform(({ value }) =>
        (value || []).map((management) => ({
            full_name: management.fullName,
            designation: management.designation,
        })),
    )
    seniorManagement: Array<{
        fullName: string;
        designation: string;
    }>;

    @Expose({ name: 'show_on_browse' })
    showOnBrowse: boolean;

    @Expose({ name: 'show_on_mobile' })
    showOnMobile: boolean;

    @Expose({ name: 'step_size' })
    stepSize: number;

    @Expose({ name: 'txn_allowed' })
    txnAllowed: boolean;

    @Expose({ name: 'updated_at' })
    updatedAt: number;

    @Expose({ name: 'order' })
    order: number;

    @Expose({ name: 'strengths' })
    strengths: string[];

    @Expose({ name: 'weaknesses' })
    weaknesses: string[];

    @Expose({ name: 'share_outstanding' })
    shareOutstanding: number;

    @Expose({ name: 'settlement_days' })
    @Transform(({ obj: { settlementDays } }) => ({
        is_show: settlementDays.isShow,
        value: settlementDays.value,
    }))
    settlementDays: {
        isShow: boolean;
        value: number;
    };

    @Expose({ name: 'ccps_disclaimer' })
    ccpsDisclaimer: {
        title: string;
        link: string;
    };

    @Expose({ name: 'staggered_price' })
    staggeredPrice: Array<number>;

    @Expose({ name: 'price' })
    price: number | null;

    @Expose({ name: 'enable_invest_button' })
    enableInvestButton: boolean;

    @Expose({ name: 'is_product_available' })
    isProductAvailable: boolean;

    constructor(partial: Partial<UnlistedEquityPresenter>) {
        Object.assign(this, partial);
    }
}
