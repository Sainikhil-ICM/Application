export class SipTransformDataDto {
    frequency: string;
    dates: number[];
    min_gap: number;
    max_gap: number;
    min_installment_amt: number;
    max_installment_amt: number;
    min_installment_nums: number;
    max_installment_nums: number;
    sip_multiplier_amt: number;

    constructor(data: any) {
        this.frequency = data.frequency.toLowerCase();
        this.dates = data.dates;
        this.min_gap = data.minGap;
        this.max_gap = data.maxGap;
        this.min_installment_amt = data.minInstallmentAmt;
        this.max_installment_amt = data.maxInstallmentAmt;
        this.min_installment_nums = data.minInstallmentNums;
        this.max_installment_nums = data.maxInstallmentNums;
        this.sip_multiplier_amt = data.sipMultiplierAmt;
    }
}
