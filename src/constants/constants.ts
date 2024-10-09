export type ResProps = {
    success: boolean;
    error?: any;
    message?: string;
    data?: any;
    errors?: any;
};

export enum QueueName {
    PRODUCTS_QUEUE = 'PRODUCTS_QUEUE',
    ACCOUNTS_QUEUE = 'ACCOUNTS_QUEUE',
}

export enum JobName {
    SYNC_MAX_RETURN_RATE = 'SYNC_MAX_RETURN_RATE',
    SEED_ROLE_GROUPS = 'SEED_ROLE_GROUPS',
}
