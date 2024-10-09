import { ObjectId } from 'mongoose';
import { UserDocument } from 'src/models/user.model';

export class UserCreateEvent {
    id: ObjectId;
    name: string;
    email: string;

    constructor(params: Partial<UserDocument>) {
        Object.assign(this, params);
    }
}
