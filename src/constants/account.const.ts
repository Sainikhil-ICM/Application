export enum AccountType {
    INDIVIDUAL = 'INDIVIDUAL',
    COMPANY = 'COMPANY',
    MIDDLEWARE = 'MIDDLEWARE',
}

export type SessionAccount = {
    account_id: string;
    account_name: string;
    account_type: AccountType;
    account_code: string;
    user_id: string;
    user_api_token: string;
};

export enum LogoType {
    STANDARD = 'STANDARD',
    WIDE = 'WIDE',
}
