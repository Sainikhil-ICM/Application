import { ProductType } from 'src/constants/product.const';
import { PaymentDocument } from 'src/models/payment.model';

export class NewPaymentEvent {
    id: string;
    customer_email: string;
    product_type: ProductType;

    constructor(params: PaymentDocument) {
        Object.assign(this, params.toJSON());
    }
}
