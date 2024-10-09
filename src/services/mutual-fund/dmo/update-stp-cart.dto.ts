export class UpdateStpCartDto {
    fromIsin: string;
    toIsin: string;
    fromBseSchemeCode: string;
    toBseSchemeCode: string;
    frequency: string;
    startDate: string;
    endDate: string;
    amount: number;
    //units: number;
    firstOrderWithRegn: boolean;
    instaDay: number;
    numInsta: number;
    folio: string;
    folioNumber: string;
    sipAllowed: boolean;

    // nameAMC: string;
    // codeFromFUND: string;
    // codeAMC: string;

    // nameFromRTA: string;
    // nameToRTA: string;

    // codeToFUND: string;

    // nav: number;
    // codeAMFI: string;
    // nameFUND: string;

    Div_Opt: string;
    userMsg: string;
    isAjax: boolean;

    // switchOutAllowed: string;
    // units: string;

    constructor(
        amt: number,
        folio: string,
        from_product: any,
        to_prodct: any,
        frequency: string,
        sipStartDate: string,
        sipEndDate: string,
        instaDay: number,
        installments: number,
    ) {
        this.amount = amt;

        this.folio = folio;
        this.folioNumber = folio;

        this.sipAllowed = true;
        this.Div_Opt = 'NA';
        //this.userMsg = 'string';
        this.isAjax = true;
        this.frequency = frequency;
        this.startDate = sipStartDate;
        this.endDate = sipEndDate;
        this.instaDay = instaDay;
        this.firstOrderWithRegn = true;
        // this.nameFromRTA = from_product.schemeName;
        // this.codeFromFUND = from_product.rtaCode;
        // this.nameToRTA = to_prodct.schemeName;
        // this.codeToFUND = to_prodct.rtaCode;

        // this.nameAMC = 'Equity';
        // this.codeAMC = from_product.rtaAmcCode;
        this.fromIsin = from_product.ISIN;
        this.fromBseSchemeCode = String(from_product.bseSchemeCode);
        this.toIsin = to_prodct.ISIN;
        this.toBseSchemeCode = to_prodct.bseSchemeCode;
        this.numInsta = installments;
        //this.switchOutAllowed = 'Y';
        //this.units = '';
        // this.bseSchemeCode = 'HDHPRGR-GR';
    }
}
