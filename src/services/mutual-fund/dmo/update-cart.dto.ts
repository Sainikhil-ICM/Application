export class UpdateCartDto {
    amount: number;
    dname: string;
    nameRTA: string;
    folio: number;
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

    constructor(amount: number, product: any) {
        this.amount = amount;
        this.dname = product.schemeName;
        this.nameRTA = product.schemeName;
        this.folio = product.amfiCode;
        this.folioNumber = '';
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

        // this.bseSchemeCode = 'HDHPRGR-GR';
    }
}
