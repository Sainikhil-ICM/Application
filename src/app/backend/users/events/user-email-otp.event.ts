type UserEmailOtpTriggerEventProps = {
    token: string;
    email: string;
};

export class UserEmailOtpTriggerEvent {
    token: string;
    email: string;

    constructor(params: UserEmailOtpTriggerEventProps) {
        Object.assign(this, params);
    }
}
