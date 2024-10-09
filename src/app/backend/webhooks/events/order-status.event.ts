import { OrderStatus } from 'src/constants/payment.const';

type OrderStatusEventProps = {
    order_id: string;
    status: OrderStatus;
    account_id: string;
};

export class OrderStatusEvent {
    order_id: string;
    status: OrderStatus;
    account_id: string;

    constructor(params: OrderStatusEventProps) {
        Object.assign(this, params);
    }
}
