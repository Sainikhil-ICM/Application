type UserRegistrationRejectEventProps = {
    name: string;
    email: string;
    logo_url: string;
    remarks: string;
};

export class UserRegistrationRejectEvent {
    name: string;
    email: string;
    remarks: string;
    logo_url: string;

    constructor(params: UserRegistrationRejectEventProps) {
        Object.assign(this, params);
    }
}
