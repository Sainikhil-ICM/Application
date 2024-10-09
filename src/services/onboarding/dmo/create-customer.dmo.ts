import { ConnectionType } from 'src/models';

export class CreateCustomerDmo {
    account_code: string;
    name: string;
    email: string;
    phone_number: string;
    connection_type: ConnectionType;

    constructor(createCustomerDmo: CreateCustomerDmo) {
        Object.assign(this, createCustomerDmo);
    }
}

export type CreateCustomerResp = {
    foreign_id: string;
    access_token: string;
    access_token_expires_at: Date;
    api_token: string;
    is_existing_customer: boolean;
};
