export class StpTransformDataDto {
    frequency: string;
    dates: number[];
    min_gap: number;
    max_gap: number;
    min_switch_out_installment_amt: number;
    max_switch_out_installment_amt: number;
    stp_switch_out_multiplier_amt: number;
    min_switch_in_installment_amt: number;
    max_switch_in_installment_amt: number;
    stp_switch_in_multiplier_amt: number;
    min_installment_nums: number;
    max_installment_nums: number;

    constructor(data: any) {
        this.frequency = data.frequency.toLowerCase();
        this.dates = data.dates;
        this.min_gap = data.minGap;
        this.max_gap = data.maxGap;
        this.min_switch_out_installment_amt = data.minSwitchOutInstallmentAmt;
        this.max_switch_out_installment_amt = data.maxSwitchOutInstallmentAmt;
        this.stp_switch_out_multiplier_amt = data.stpSwitchOutMultiplierAmt;
        this.min_switch_in_installment_amt = data.minSwitchInInstallmentAmt;
        this.max_switch_in_installment_amt = data.maxSwitchInInstallmentAmt;
        this.stp_switch_in_multiplier_amt = data.stpSwitchInMultiplierAmt;
        this.min_installment_nums = data.minInstallmentNums;
        this.max_installment_nums = data.maxInstallmentNums;
    }
}
