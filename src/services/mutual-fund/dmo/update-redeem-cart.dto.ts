export class UpdateRedeemCartDto {
    amount: number;
    dname: string;
    nameRTA: string;
    folio: string;
    folioNumber: string;
    nameAMC: string;
    codeFUND: string;
    codeAMC: string;
    nav: number;
    codeAMFI: string;
    nameFUND: string;
    sipAllowed: boolean;
    Div_Opt: string;
    userMsg: string;
    isAjax: boolean;
    isin: string;
    bseSchemeCode: string;
    switchOutAllowed: string;
    units: string;

    constructor(amt: number, folio: string, product: any) {
        this.amount = amt;
        this.dname = product.schemeName;
        this.nameRTA = product.schemeName;
        this.folio = folio;
        this.folioNumber = folio;
        this.nameAMC = 'Equity';
        this.codeFUND = product.rtaCode;
        this.codeAMC = '';
        this.nav = product.nav;
        this.codeAMFI = product.amfiCode;
        this.nameFUND = product.schemeName;
        this.sipAllowed = true;
        this.Div_Opt = 'NA';
        this.userMsg = 'string';
        this.isAjax = true;
        this.isin = product.ISIN;
        this.bseSchemeCode = product.bseSchemeCode;
        this.switchOutAllowed = 'Y';
        this.units = '';
        // this.bseSchemeCode = 'HDHPRGR-GR';
    }
}
