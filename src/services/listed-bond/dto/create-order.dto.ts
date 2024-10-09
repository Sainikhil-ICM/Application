type CreateOrderDtoProps = {
    demat_number: string;
    units: number;
    return_rate: number;
    kyc_id: string;
    pan_number: string;
    product_code: string;
    product_isin: string;
    account_code: string;
    access_token: string;
};

export class CreateOrderDto {
    demat: string;
    units: number;
    expectedXirr: number;
    custId: string;
    pan: string;
    product: string;
    ISIN: string;
    accountCode: string;
    accessToken: string;

    constructor(params: CreateOrderDtoProps) {
        this.demat = params.demat_number;
        this.units = params.units;
        this.expectedXirr = params.return_rate;
        this.custId = params.kyc_id;
        this.pan = params.pan_number;
        this.product = params.product_code;
        this.ISIN = params.product_isin;
        this.accountCode = params.account_code;
        this.accessToken = params.access_token;
    }
}

export type CreateOrderResp = {
    _id: string;
    orderId: string;
    ISIN: string;
    accountNumber: string;
    amount: number;
    amountBreakup: {
        isTxnAllowed: boolean;
        unitPrice: number;
        units: number;
        unitsUnderBenefit: number;
        unitsNotUnderBenefit: number;
        ytmWithBenefit: number;
        ytmWithoutBenefit: number;
        benefitUserAmount: number;
        withoutBenefitUserAmount: number;
        benefit: number;
        amount: number;
        userAmount: number;
        oroAmount: number;
        ytm: number;
        tradeDate: string;
        settlementDate: string;
        referralBenefits: {
            ts: number;
            limitExpired: boolean;
            txnCountLimit: number;
            txnWithinDaysLimit: number;
            perTxnReferrerBenefitLimit: number;
            perTxnRefereralBenefitLimit: number;
            perTxnRefereralSpecialBenefitLimit: number;
            discountForReferal: number;
            benefitToReferrer: number;
            isSpecialBenefitUser: boolean;
            benefitThreshold: boolean;
            discountInPercForUser: number;
            userAmount: number;
            product: string;
            cashBackToReferrerFirstTxnLimit: number;
            cashBackToReferralOnFirstTxn: number;
            isUserVerified: boolean;
            isFirstTxn: boolean;
            txnCount: number;
            isNewUser: boolean;
            specialBenefitExpiringInDays: number;
        };
        accruedInterest: number;
        remainingPrincipalPerc: number;
    };
    amountDue: number;
    amountPaid: number;
    attempts: number;
    createdAt: number;
    currency: string;
    custId: string;
    custName: string;
    demat: string;
    dpName: string;
    email: string;
    entity: string;
    ifscCode: string;
    key_id: string;
    maturityDate: string;
    notes: {
        [key: string]: string;
    };
    offerId: string | null;
    pan: string;
    partner: string;
    paymentType: string | null;
    product: string;
    productName: string;
    productType: string;
    receipt: string;
    redirect: boolean;
    rfqOrderDetails: null;
    status: string;
    subPartner: string;
    subType: string;
    timeStamp: string;
    type: string;
    url: string;
    userId: string;
};
