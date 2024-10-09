import { UserDocument } from 'src/models';

type ResetPasswordEventProps = {
    token: string;
    user: UserDocument;
};

export class ResetPasswordEvent {
    token: string;
    user: UserDocument;

    constructor(params: ResetPasswordEventProps) {
        Object.assign(this, params);
    }
}
