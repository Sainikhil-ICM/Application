export class UpdateSwitchCartDto {
    amt: number;
    dname: string;
    nameFromRTA: string;
    nameToRTA: string;
    folio: string;
    folioNumber: string;
    nameAMC: string;
    codeFromFUND: string;
    codeToFUND: string;
    codeAMC: string;
    nav: number;
    codeAMFI: string;
    nameFUND: string;
    sipAllowed: boolean;
    Div_Opt: string;
    userMsg: string;
    isAjax: boolean;
    fromIsin: string;
    toIsin: string;
    fromBseSchemeCode: string;
    toBseSchemeCode: string;
    switchOutAllowed: string;
    // units: string;

    constructor(amt: number, folio: string, from_product: any, to_prodct: any) {
        this.amt = amt;

        this.folio = folio;
        this.folioNumber = folio;

        this.sipAllowed = true;
        this.Div_Opt = 'NA';
        this.userMsg = 'string';
        this.isAjax = true;

        this.nameFromRTA = from_product.schemeName;
        this.codeFromFUND = from_product.rtaCode;
        this.nameToRTA = to_prodct.schemeName;
        this.codeToFUND = to_prodct.rtaCode;

        this.nameAMC = 'Equity';
        this.codeAMC = from_product.rtaAmcCode;
        this.fromIsin = from_product.ISIN;
        this.fromBseSchemeCode = from_product.bseSchemeCode;
        this.toIsin = to_prodct.ISIN;
        this.toBseSchemeCode = to_prodct.bseSchemeCode;

        this.switchOutAllowed = 'Y';
        //this.units = '';
        // this.bseSchemeCode = 'HDHPRGR-GR';
    }
}
