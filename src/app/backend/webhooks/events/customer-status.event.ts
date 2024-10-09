import { CustomerKycStatus } from 'src/constants/customer.const';

type CustomerStatusEventProps = {
    customer_id: string;
    account_ids: string[];
    status: CustomerKycStatus;
    remarks: string[];
};

export class CustomerStatusEvent {
    customer_id: string;
    account_ids: string[];
    status: CustomerKycStatus;
    remarks: string[];

    constructor(params: CustomerStatusEventProps) {
        Object.assign(this, params);
    }
}
