import { AccessControlList } from 'src/constants/access-control.const';

export enum RoleGroupTypes {
    _ACCOUNT_ADMIN = '_ACCOUNT_ADMIN',
    _COUNTRY_MANAGER = '_COUNTRY_MANAGER',
    _MANAGER = '_MANAGER',
    _OPS_MANAGER = '_OPS_MANAGER',
    _RELATIONSHIP_MANAGER = '_RELATIONSHIP_MANAGER',
    _RELATIONSHIP_ADVISOR = '_RELATIONSHIP_ADVISOR',
}

export const roleGroups = {
    [RoleGroupTypes._ACCOUNT_ADMIN]: {
        name: 'Account Admin',
        description:
            'Can view transactions, customers, assign roles to other users, list products and upload content related to knowledge repository.',
        type: '_ACCOUNT_ADMIN',
        roles: [
            AccessControlList.LIST_ACCOUNT_LEADS,
            AccessControlList.LIST_ACCOUNT_CUSTOMERS,
            AccessControlList.LIST_ACCOUNT_ORDERS,
            AccessControlList.ADD_ACCOUNT_USERS,
            AccessControlList.LIST_ACCOUNT_USERS,
            AccessControlList.EDIT_ACCOUNT_USERS,
            AccessControlList.DELETE_ACCOUNT_USERS,
            AccessControlList.LIST_ACCOUNT_PRODUCTS,
        ],
    },
    [RoleGroupTypes._COUNTRY_MANAGER]: {
        name: 'Country Manager',
        description:
            'Head at partner end to whom everyone reports, typically does not manage customers directly.',
        type: '_COUNTRY_MANAGER',
        roles: [
            AccessControlList.LIST_ACCOUNT_LEADS,
            AccessControlList.LIST_ACCOUNT_CUSTOMERS,
            AccessControlList.LIST_ACCOUNT_ORDERS,
            AccessControlList.LIST_ACCOUNT_USERS,
        ],
    },
    [RoleGroupTypes._MANAGER]: {
        name: 'Manager',
        description: 'Manages a set of RMs, may or may not manage customers directly.',
        type: '_MANAGER',
        roles: [
            AccessControlList.LIST_MANAGED_LEADS,
            AccessControlList.ADD_MANAGED_USERS,
            AccessControlList.LIST_MANAGED_USERS,
            AccessControlList.LIST_MANAGED_CUSTOMERS,
            AccessControlList.LIST_MANAGED_ORDERS,
            AccessControlList.EDIT_MANAGED_USERS,
            AccessControlList.DELETE_MANAGED_USERS,
        ],
    },
    [RoleGroupTypes._OPS_MANAGER]: {
        name: 'Ops Manager',
        description: 'Access to approve/reject customers and transactions.',
        type: '_OPS_MANAGER',
        roles: [
            AccessControlList.LIST_ACCOUNT_CUSTOMERS,
            AccessControlList.EDIT_ACCOUNT_CUSTOMERS,
            AccessControlList.LIST_ACCOUNT_ORDERS,
            AccessControlList.EDIT_ACCOUNT_ORDERS,
        ],
    },
    [RoleGroupTypes._RELATIONSHIP_MANAGER]: {
        name: 'Relationship Manager',
        description: 'Manages leads, customers and orders.',
        type: '_RELATIONSHIP_MANAGER',
        roles: [
            AccessControlList.LIST_USER_LEADS,
            AccessControlList.ADD_USER_CUSTOMERS,
            AccessControlList.LIST_USER_CUSTOMERS,
            AccessControlList.EDIT_USER_CUSTOMERS,
            AccessControlList.ADD_USER_ORDERS,
            AccessControlList.LIST_USER_ORDERS,
            AccessControlList.LIST_ACCOUNT_PRODUCTS,
        ],
    },
    [RoleGroupTypes._RELATIONSHIP_ADVISOR]: {
        name: 'Relationship Advisor',
        description: 'Manages leads, customers and orders.',
        type: '_RELATIONSHIP_ADVISOR',
        roles: [
            AccessControlList.LIST_USER_LEADS,
            AccessControlList.ADD_USER_CUSTOMERS,
            AccessControlList.LIST_USER_CUSTOMERS,
            AccessControlList.EDIT_USER_CUSTOMERS,
            AccessControlList.ADD_USER_ORDERS,
            AccessControlList.LIST_USER_ORDERS,
            AccessControlList.LIST_ACCOUNT_PRODUCTS,
        ],
    },
};
