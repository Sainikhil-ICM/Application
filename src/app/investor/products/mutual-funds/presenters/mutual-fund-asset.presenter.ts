import { Exclude, Expose, Transform } from 'class-transformer';

type Return = { date: string | null; nav: number | null; ret: number | null };

@Exclude()
export class MutualFundAssetPresenter {
    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'is_bse' })
    isBSE: boolean;

    @Expose({ name: 'aum' })
    AUM: number;

    @Expose({ name: 'rta_code' })
    rtaCode: string;

    @Expose({ name: 'rta_amc_code' })
    rtaAmcCode: string;

    @Expose({ name: 'amfi_code' })
    amfiCode: number;

    @Expose({ name: 'scheme_name' })
    schemeName: string;

    @Expose({ name: 'amc_name' })
    amcName: string;

    @Expose({ name: 'nav' })
    NAV: number;

    @Expose({ name: 'risk_rating' })
    riskRating: string;

    @Expose({ name: 'equity_or_not' })
    equityOrNot: boolean;

    @Expose({ name: 'open_closed_interval_elss' })
    openClosedIntervalELSS: string;

    @Expose({ name: 'scheme_status' })
    schemeStatus: string;

    @Expose({ name: 'sip_allowed' })
    sipAllowed: boolean;

    @Expose({ name: 'allowed_txns' })
    @Transform(({ obj: { allowedTxns } }) => ({
        purchase: allowedTxns.purchase,
        sip: allowedTxns.sip,
        switch_in: allowedTxns.switchIn,
        switch_out: allowedTxns.switchOut,
        stp_in: allowedTxns.stpIn,
        stp_out: allowedTxns.stpOut,
        redeem: allowedTxns.redeem,
        swp: allowedTxns.swp,
    }))
    allowedTxns: {
        purchase: boolean;
        sip: boolean;
        switch_in: boolean;
        switch_out: boolean;
        stp_in: boolean;
        stp_out: boolean;
        redeem: boolean;
        swp: boolean;
    };

    @Expose({ name: 'txn_limits' })
    @Transform(({ obj: { txnLimits } }) => ({
        purchase_min: txnLimits.purchaseMin,
        additional_purchase_min: txnLimits.additionalPurchaseMin,
    }))
    txnLimits: {
        purchase_min: number | null;
        additional_purchase_min: number | null;
    };

    @Expose({ name: 'fund_type' })
    fundType: string;

    @Expose({ name: 'asset_class' })
    assetClass: string;

    @Expose({ name: 'benchmark' })
    benchmark: string;

    @Expose({ name: 'objective' })
    objective: string;

    @Expose({ name: 'portfolio' })
    @Transform(({ obj: { portfolio } }) => ({
        holdings: portfolio.holdings,
        sectors: portfolio.sectors,
        ratings: portfolio.ratings,
        market_caps: portfolio.marketCaps,
    }))
    portfolio: {
        holdings: Array<{
            name: string;
            percentage: number;
            rating: string;
            sector: string;
            classification: string;
        }>;
        sectors: Array<{
            sector: string;
            percentage: number;
        }>;
        ratings: Array<{
            rating: string;
            percentage: number;
        }>;
        market_caps: Array<Array<string | number>>;
    };

    @Expose({ name: 'fund_managers' })
    @Transform(({ value }) =>
        (value ?? []).map((manager: any = {}) => ({
            initial: manager.initial ?? '',
            fund_manager: manager.fundManager ?? '',
            qualification: manager.qualification ?? '',
            experience: manager.experience ?? '',
            basic_details: manager.basicDetails ?? '',
            designation: manager.designation ?? '',
            age: manager.age ?? null,
            reported_date: manager.reportedDate ?? '',
        })),
    )
    fundManagers: Array<{
        initial: string;
        fund_manager: string;
        qualification: string;
        experience: string;
        basic_details: string;
        designation: string;
        age: number;
        reported_date: string;
    }>;

    @Expose({ name: 'annualised_returns' })
    @Transform(({ obj: { annualisedReturns } }) => ({
        one_day: annualisedReturns.oneDay,
        one_week: annualisedReturns.oneWeek,
        one_month: annualisedReturns.oneMonth,
        three_months: annualisedReturns.threeMonths,
        six_months: annualisedReturns.sixMonths,
        nine_months: annualisedReturns.nineMonths,
        one_year: annualisedReturns.oneYear,
        two_years: annualisedReturns.twoYears,
        three_years: annualisedReturns.threeYears,
        four_years: annualisedReturns.fourYears,
        five_years: annualisedReturns.fiveYears,
        inception: annualisedReturns.inception,
    }))
    annualisedReturns: {
        one_day: object;
        one_week: { date: string | null; nav: number | null };
        one_month: Return;
        three_months: Return;
        six_months: Return;
        nine_months: Return;
        one_year: Return;
        two_years: Return;
        three_years: Return;
        four_years: Return;
        five_years: Return;
        inception: Return;
    };

    @Expose({ name: 'absolute_returns' })
    @Transform(({ obj: { absoluteReturns } }) => ({
        one_day: absoluteReturns.oneDay,
        one_week: absoluteReturns.oneWeek,
        one_month: absoluteReturns.oneMonth,
        three_months: absoluteReturns.threeMonths,
        six_months: absoluteReturns.sixMonths,
        nine_months: absoluteReturns.nineMonths,
        one_year: absoluteReturns.oneYear,
        two_years: absoluteReturns.twoYears,
        three_years: absoluteReturns.threeYears,
        four_years: absoluteReturns.fourYears,
        five_years: absoluteReturns.fiveYears,
        inception: absoluteReturns.inception,
    }))
    absoluteReturns: {
        one_day: object;
        one_week: { date: string | null; nav: number | null };
        one_month: Return;
        three_months: Return;
        six_months: Return;
        nine_months: Return;
        one_year: Return;
        two_years: Return;
        three_years: Return;
        four_years: Return;
        five_years: Return;
        inception: Return;
    };

    @Expose({ name: 'ratios' })
    @Transform(({ obj: { ratios } }) => ({
        beta_x: ratios.betaX,
        beta_y: ratios.betaY,
        sharpe_x: ratios.sharpeX,
        sharpe_y: ratios.sharpeY,
        j_alpha_x: ratios.jAlphaX,
        j_alpha_y: ratios.jAlphaY,
    }))
    ratios: {
        beta_x: number | null;
        beta_y: number | null;
        sharpe_x: number | null;
        sharpe_y: number | null;
        j_alpha_x: number | null;
        j_alpha_y: number | null;
    };

    @Expose({ name: 'fundamentals' })
    @Transform(({ obj: { fundamentals } }) => ({
        mcap: fundamentals.MCAP,
        pe: fundamentals.PE,
        pb: fundamentals.PB,
        expense_ratio: fundamentals.expenseRatio,
    }))
    fundamentals: {
        mcap: number | null;
        pe: number | null;
        pb: number | null;
        expense_ratio: number;
    };

    @Expose({ name: 'exit_load' })
    exitLoad: number;

    @Expose({ name: 'primary' })
    primary: boolean;

    @Expose({ name: 'parent_amfi_code' })
    ParentAMFICode: number;

    constructor(partial: Partial<MutualFundAssetPresenter>) {
        Object.assign(this, partial);
    }
}
