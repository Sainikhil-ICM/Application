import { ApiResource } from 'src/constants/app.const';

const accountsResource: ApiResource = {
    name: 'accounts',
    path: '/docs/resources/backend/accounts',
    description:
        'The product APIs facilitate interactions with accounts information. They include endpoints for retrieving a list of available accounts, detailed information about a specific accounts',
    title: 'The Product model',
    subtitle:
        'This database model encompasses various details including identifiers such as type,code,logo.',
    properties: [
        {
            name: 'name',
            type: 'string',
            description: 'Account name.',
        },
        {
            name: 'type',
            type: 'string',
            description: 'Type of account[INDIVIDUAL,COMPANY,MIDDLEWARE].',
        },
        {
            name: 'code',
            type: 'string',
            description: 'Code for your account{default:ICMP000}.',
        },
        {
            name: 'logo',
            type: 'number',
            description: 'Logo link for account.',
        },
        {
            name: 'api_token',
            type: 'string',
            description: 'api_token of the customer',
        },
        {
            name: 'user_api_token',
            type: 'string',
            description: 'User api toke.',
        },
        {
            name: 'webhooks',
            type: 'number',
            description: 'webhooks for account.',
        },
        {
            name: 'is_deleted',
            type: 'string',
            description: 'Soft delete account.',
        },
    ],
    endpoints: [
        {
            method: 'GET',
            path: '/accounts/:account_id/overview',
            title: 'Overview of account',
            description: 'This endpoint allows you to retrieve a Overview of account.',
            optionalAttributes: [
                {
                    name: 'account_id',
                    type: 'string',
                    description: 'Account id of customer',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/accounts/account_id/overview' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'account_id="65574c5e3645875325001d12"' \n`,
            },
            response: {
                success: true,
                data: {
                    total_advisors: 2,
                    total_customers: 6,
                    active_customers: 1,
                    total_trxns: 12,
                    pending_trxns: 2,
                    aumBreakUp: [],
                    monthwiseTransactionCounts: [
                        {
                            count: 3,
                            month: 1,
                        },
                        {
                            count: 9,
                            month: 12,
                        },
                    ],
                    monthwiseCustomerCounts: [],
                    monthwiseAdvisorCounts: [
                        {
                            count: 2,
                            month: 12,
                        },
                    ],
                },
            },
        },
        {
            method: 'GET',
            path: '/accounts/:account_id/users',
            title: 'Account of users',
            description: 'This endpoint allows you to retrieve a users account.',
            optionalAttributes: [
                {
                    name: 'account_id',
                    type: 'string',
                    description: 'Account id of customer',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/accounts/account_id/users' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'account_id="65574c5e3645875325001d12"' \n`,
            },
            response: {
                success: true,
                data: [
                    {
                        _id: '6572b385b683246e9a844e00',
                        total_customers: 6,
                        total_payments: 0,
                        advisor_name: 'MOULESH DILIP CHAVAN',
                        asset_holdings: 0,
                    },
                    {
                        _id: '658d6d73d5dc7d8bed813887',
                        total_customers: 0,
                        total_payments: 0,
                        advisor_name: 'mouleshchavan94',
                        asset_holdings: 0,
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/accounts/:account_id',
            title: 'Account of users',
            description: 'This endpoint allows you to retrieve a users name,type API_TOKEN,code.',
            optionalAttributes: [
                {
                    name: 'account_id',
                    type: 'string',
                    description: 'Account id of customer',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/accounts/account_id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'account_id="65574c5e3645875325001d12"' \n`,
            },
            response: {
                success: true,
                data: {
                    name: '',
                    type: 'INDIVIDUAL',
                    code: 'ICMP000',
                    api_token: '461c6d1b3da9c6d44482c46906d56e386dbae8444fc2eaaec94b5fafecf1318a',
                    id: '6572b385b683246e9a844dfc',
                },
            },
        },
    ],
};

export default accountsResource;
