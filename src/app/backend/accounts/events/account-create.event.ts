import { Account } from 'src/models/account.model';

export class AccountCreateEvent {
    id: string;
    name: string;

    constructor(params: Partial<Account>) {
        Object.assign(this, params);
    }
}
