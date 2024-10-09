export class UpdateSwpCartDto {
    isin: string;
    bseSchemeCode: string;
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
    codeFUND: string;
    codeAMC: string;
    nameAMC: string;
    nameRTA: string;
    codeAMFI: string;
    nameFUND: string;
    Div_Opt: string;
    userMsg: string;
    isAjax: boolean;

    constructor(
        amt: number,
        folio: string,
        to_prodct: any,
        frequency: string,
        sipStartDate: string,
        sipEndDate: string,
        instaDay: number,
        installments: number,
    ) {
        this.amount = amt;

        this.folio = '';
        this.folioNumber = folio;

        this.sipAllowed = true;

        //this.userMsg = 'string';

        this.frequency = frequency;
        this.startDate = sipStartDate;
        this.endDate = sipEndDate;
        this.instaDay = instaDay;
        this.codeFUND = '';
        this.nameRTA = '';
        this.codeAMFI = '';
        this.nameFUND = '';
        // this.nameFromRTA = from_product.schemeName;
        // this.codeFromFUND = from_product.rtaCode;
        // this.nameToRTA = to_prodct.schemeName;
        // this.codeToFUND = to_prodct.rtaCode;

        this.nameAMC = '';
        this.codeAMC = '';

        this.isin = to_prodct.ISIN;
        this.bseSchemeCode = to_prodct.bseSchemeCode;
        this.numInsta = installments;
        //this.switchOutAllowed = 'Y';
        //this.units = '';
        // this.bseSchemeCode = 'HDHPRGR-GR';
    }
}
