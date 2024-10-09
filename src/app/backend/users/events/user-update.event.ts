import { UserDocument } from 'src/models/user.model';

export class UserUpdateEvent {
    name: string;
    email: string;
    zoho_id: string;

    constructor(params: Partial<UserDocument>) {
        Object.assign(this, params);
    }
}
