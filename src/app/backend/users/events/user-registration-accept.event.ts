type UserRegistrationAcceptEventProps = {
    user_code: string;
    name: string;
    email: string;
    logo_url: string;
};

export class UserRegistrationAcceptEvent {
    user_code: string;
    name: string;
    email: string;
    logo_url: string;

    constructor(params: UserRegistrationAcceptEventProps) {
        Object.assign(this, params);
    }
}
