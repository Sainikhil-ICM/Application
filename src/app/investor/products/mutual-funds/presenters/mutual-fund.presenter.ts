import { Exclude, Expose } from 'class-transformer';
@Exclude()
export class MutualFundPresenter {
    @Expose({ name: 'isin' })
    isin: string;

    @Expose({ name: 'is_bse' })
    isBSE: boolean;

    @Expose({ name: 'bse_scheme_code' })
    bseSchemeCode: string;

    @Expose({ name: 'rta_code' })
    rtaCode: string;

    @Expose({ name: 'amc_code' })
    amcCode: string;

    @Expose({ name: 'amfi_code' })
    amfiCode: number;

    @Expose({ name: 'aum' })
    AUM: number;

    @Expose({ name: 'age' })
    age: string;

    @Expose({ name: 'asset_class' })
    assetClass: string;

    @Expose({ name: 'benchmark' })
    benchmark: string;

    @Expose({ name: 'direct_expense_ratio' })
    directExpenseRatio: number;

    @Expose({ name: 'display_name' })
    displayName: string;

    @Expose({ name: 'exit_load' })
    exitLoad: string;

    @Expose({ name: 'fund_type' })
    fundType: string;

    @Expose({ name: 'oro_asset_class' })
    oroAssetClass: string;

    @Expose({ name: 'objectives' })
    objectives: string;

    @Expose({ name: 'riskometer' })
    riskometer: string;

    @Expose({ name: 'sebi_category' })
    sebiCategory: string;

    @Expose({ name: 'scheme_name' })
    schemeName: string;

    @Expose({ name: 'amc_name' })
    amcName: string;

    @Expose({ name: 'category' })
    category: string;

    @Expose({ name: 'folio' })
    folio: number;

    @Expose({ name: 'name' })
    name: string;

    @Expose({ name: 'scheme_status' })
    schemeStatus: string;

    @Expose({ name: 'primary' })
    primary: boolean;

    @Expose({ name: 'nav' })
    nav: number;

    @Expose({ name: 'aum' })
    aum: string;

    @Expose({ name: 'fund_manager' })
    fundManager: string;

    constructor(partial: Partial<MutualFundPresenter>) {
        Object.assign(this, partial);
    }
}
