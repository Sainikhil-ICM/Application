import { ObjectId } from 'mongoose';

type UserRegistrationEventProps = {
    id: ObjectId;
    name: string;
    email: string;
    logo_url: string;
};

export class UserRegistrationEvent {
    id: ObjectId;
    name: string;
    email: string;
    logo_url: string;

    constructor(params: UserRegistrationEventProps) {
        Object.assign(this, params);
    }
}
