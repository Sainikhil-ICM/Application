export enum AccessControlStatus {
    INVITATION_SENT = 'INVITATION_SENT',
    BASIC_DETAILS_ENTERED = 'BASIC_DETAILS_ENTERED',
    KYD_VERIFICATION_PENDING = 'KYD_VERIFICATION_PENDING',
    REGISTRATION_COMPLETED = 'REGISTRATION_COMPLETED',
    ACCOUNT_ACTIVE = 'ACCOUNT_ACTIVE',
    ACCOUNT_REVOKED = 'ACCOUNT_REVOKED',
}

export enum InvitationSource {
    ADMIN = 'ADMIN',
    WEBSITE = 'WEBSITE',
    ROLE_GROUP_URL = 'ROLE_GROUP_URL',
}

export enum AccessControlList {
    ADD_USER_LEADS = 'ADD_USER_LEADS',
    LIST_LEADS = 'LIST_LEADS',
    LIST_ACCOUNT_LEADS = 'LIST_ACCOUNT_LEADS',
    LIST_MANAGED_LEADS = 'LIST_MANAGED_LEADS',
    LIST_USER_LEADS = 'LIST_USER_LEADS',

    ADD_USER_CUSTOMERS = 'ADD_USER_CUSTOMERS',
    LIST_CUSTOMERS = 'LIST_CUSTOMERS',
    LIST_ACCOUNT_CUSTOMERS = 'LIST_ACCOUNT_CUSTOMERS',
    LIST_MANAGED_CUSTOMERS = 'LIST_MANAGED_CUSTOMERS',
    LIST_USER_CUSTOMERS = 'LIST_USER_CUSTOMERS',
    EDIT_ACCOUNT_CUSTOMERS = 'EDIT_ACCOUNT_CUSTOMERS',
    EDIT_USER_CUSTOMERS = 'EDIT_USER_CUSTOMERS',

    ADD_USER_ORDERS = 'ADD_USER_ORDERS',
    LIST_ORDERS = 'LIST_ORDERS',
    LIST_ACCOUNT_ORDERS = 'LIST_ACCOUNT_ORDERS',
    LIST_MANAGED_ORDERS = 'LIST_MANAGED_ORDERS',
    LIST_USER_ORDERS = 'LIST_USER_ORDERS',
    EDIT_ACCOUNT_ORDERS = 'EDIT_ACCOUNT_ORDERS',
    EDIT_USER_ORDERS = 'EDIT_USER_ORDERS',

    ADD_ACCOUNT_USERS = 'ADD_ACCOUNT_USERS',
    ADD_MANAGED_USERS = 'ADD_MANAGED_USERS',
    LIST_USERS = 'LIST_USERS',
    LIST_ACCOUNT_USERS = 'LIST_ACCOUNT_USERS',
    LIST_MANAGED_USERS = 'LIST_MANAGED_USERS',
    EDIT_ACCOUNT_USERS = 'EDIT_ACCOUNT_USERS',
    EDIT_MANAGED_USERS = 'EDIT_MANAGED_USERS',
    DELETE_ACCOUNT_USERS = 'DELETE_ACCOUNT_USERS',
    DELETE_MANAGED_USERS = 'DELETE_MANAGED_USERS',

    ADD_PRODUCTS = 'ADD_PRODUCTS',
    LIST_PRODUCTS = 'LIST_PRODUCTS',
    LIST_ACCOUNT_PRODUCTS = 'LIST_ACCOUNT_PRODUCTS',
    EDIT_PRODUCTS = 'EDIT_PRODUCTS',
    DELETE_PRODUCTS = 'DELETE_PRODUCTS',

    LIST_MANAGED_USER_CUSTOMERS = 'LIST_MANAGED_USER_CUSTOMERS',
    LIST_MANAGED_USER_ORDERS = 'LIST_MANAGED_USER_ORDERS',

    // _NATIONAL_HEAD = '_NATIONAL_HEAD',
    // _ADMIN = '_ADMIN',
    // _MANAGER = '_MANAGER',
    // _OPERATIONS = '_OPERATIONS',
    // _SALES = '_SALES',

    // ADD_CONTENT = 'ADD_CONTENT',
    // EDIT_CONTENT = 'EDIT_CONTENT',
    // DELETE_CONTENT = 'DELETE_CONTENT',

    // ADD_MANAGER = 'ADD_MANAGER',
    // EDIT_MANAGER = 'EDIT_MANAGER',

    // READ_PORTFOLIO = 'READ_PORTFOLIO',

    // READ_ACCOUNT = 'READ_ACCOUNT',
    // EDIT_ACCOUNT = 'EDIT_ACCOUNT',
}
