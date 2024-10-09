import { ObjectId } from 'mongoose';
import { AccessControlList } from './access-control.const';

export type SessionUser = {
    sub: string;
    user_id: ObjectId;
    account_id: ObjectId;
    roles: AccessControlList[];
    role: UserRole;
};

export enum UserRole {
    ADMIN = 'ADMIN',
    EXECUTIVE = 'EXECUTIVE',
    MANAGER = 'MANAGER',
    OPERATIONS = 'OPERATIONS',
    SALES = 'SALES',
    ADVISOR = 'ADVISOR',
}

export enum UserStatus {
    INVITATION_SENT = 'INVITATION_SENT',
    BASIC_DETAILS_ENTERED = 'BASIC_DETAILS_ENTERED',
    KYD_VERIFICATION_PENDING = 'KYD_VERIFICATION_PENDING',
    REGISTRATION_COMPLETED = 'REGISTRATION_COMPLETED',
    ACCOUNT_ACTIVE = 'ACCOUNT_ACTIVE',
    ACCOUNT_REVOKED = 'ACCOUNT_REVOKED',
}
