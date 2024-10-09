import { BrandName } from 'src/constants/mailer.const';
import { MfSubType, PaymentType } from 'src/constants/payment.const';
import { ProductType } from 'src/constants/product.const';
import { PaymentDocument } from 'src/models/payment.model';

export class OrderCreatedEventDto {
    id: string;
    customer_email: string;
    product_type: ProductType;
    path_name: string;
    brand_name: BrandName;

    constructor(params: Partial<PaymentDocument>) {
        // Object.assign(this, params);
        this.id = params.id;
        this.customer_email = params.customer_email;
        this.product_type = params.product_type;
        this.brand_name = BrandName.PARTNER;

        if (params.product_type === ProductType.MLD) {
            this.path_name = `/payments/${params.id}/market-linked-debentures`;
            this.brand_name = BrandName.BIDD;
        }

        if (params.product_type === ProductType.UNLISTED_EQUITY) {
            this.path_name = `/payments/${params.id}/unlisted-equities`;
        }

        if (params.product_type === ProductType.LISTED_BOND) {
            this.path_name = `/payments/${params.id}/listed-bonds`;
            this.brand_name = BrandName.BIDD;
        }

        if (params.product_type === ProductType.MUTUAL_FUND) {
            if (
                params.mutual_fund_details.sub_type === MfSubType.LUMPSUM ||
                params.mutual_fund_details.sub_type === MfSubType.SIP
            ) {
                this.path_name = `/payments/${params.id}/mutual-funds/transaction`;
            }

            if (
                [MfSubType.REDEMPTION, MfSubType.SWP].includes(params.mutual_fund_details.sub_type)
            ) {
                this.path_name = `/payments/${params.id}/redeem`;
            }

            if (
                [
                    MfSubType.SWITCH_IN,
                    MfSubType.SWITCH_OUT,
                    MfSubType.STP_IN,
                    MfSubType.STP_OUT,
                ].includes(params.mutual_fund_details.sub_type)
            ) {
                this.path_name = `/payments/${params.id}/switch`;
            }
        }
    }
}
