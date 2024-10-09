import { ApiResource } from 'src/constants/app.const';

const usersResource: ApiResource = {
    name: 'users',
    path: '/docs/resources/backend/users',
    description:
        'The User model represents user accounts information. It includes various fields to store details such as name, phone number, email address, birth date, gender,and more',
    title: 'TThe User Model',
    subtitle: 'Model for User Accounts Information',
    properties: [
        {
            name: 'name',
            type: 'string',
            description: "User's name.",
        },
        {
            name: 'phone_code',
            type: 'string',
            description: "Country code for the phone number [default: '91'].",
        },
        {
            name: 'phone_number',
            type: 'string',
            description: "User's phone number.",
        },
        {
            name: 'phone_secret',
            type: 'string',
            description: 'Secret associated with the phone number.',
        },
        {
            name: 'phone_verified',
            type: 'boolean',
            description: 'Flag indicating whether the phone number is verified [default: false].',
        },
        {
            name: 'email',
            type: 'string',
            description: "User's email address [required].",
        },
        {
            name: 'email_secret',
            type: 'string',
            description: 'Secret associated with the email address.',
        },
        {
            name: 'birth_date',
            type: 'string',
            description: "User's birth date.",
        },
        {
            name: 'gender',
            type: 'string',
            description: "User's gender.",
        },
        {
            name: 'email_verified',
            type: 'boolean',
            description: 'Flag indicating whether the email address is verified [default: false].',
        },
        {
            name: 'pan_number',
            type: 'string',
            description: "User's PAN number [unique].",
        },
        {
            name: 'password_secret',
            type: 'string',
            description: "Secret associated with the user's password.",
        },
        {
            name: 'password_reset_token_secret',
            type: 'string',
            description: 'Secret associated with the password reset token.',
        },
        {
            name: 'address',
            type: 'string',
            description: "User's address.",
        },
        {
            name: 'city',
            type: 'string',
            description: "User's city.",
        },
        {
            name: 'pin_code',
            type: 'string',
            description: "User's PIN code.",
        },
        {
            name: 'state',
            type: 'string',
            description: "User's state.",
        },
        {
            name: 'referral_code',
            type: 'string',
            description: "User's referral code.",
        },
        {
            name: 'api_token',
            type: 'string',
            description: 'API token for bonds.',
        },
        {
            name: 'is_admin',
            type: 'boolean',
            description: 'Flag indicating whether the user is an admin [default: false].',
        },
        {
            name: 'bank_account_id',
            type: 'ObjectId',
            description: 'ID of the associated bank account [indexed].',
        },
        {
            name: 'created_at',
            type: 'Date',
            description: 'Timestamp indicating the creation date.',
        },
    ],
    endpoints: [
        {
            method: 'GET',
            path: '/users/bank-account',
            title: 'Returns IFA bank account details',
            description: 'This endpoint allows you to Returns IFA bank account details.',
            optionalAttributes: [],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/users/bank-account' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    name: 'moulesh Chavan',
                    number: '8600800144',
                    ifsc_code: 'PUNB0002500',
                    address: 'Pune',
                    user_id: '6572b385b683246e9a844dfe',
                    created_at: '2024-01-04T10:13:18.674Z',
                    updated_at: '2024-01-04T10:13:57.293Z',
                    id: '659684bef7b6ae062f70b2ea',
                },
            },
        },
        {
            method: 'GET',
            path: '/users/dashboard',
            title: 'Dashboard of users',
            description: 'This endpoint allows you to dashboard a users account.',
            optionalAttributes: [],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/users/dashboard' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    customersCount: 753,
                    verifiedCustomers: 148,
                    totalTransactions: 842,
                    totalAdvisors: 205,
                    activeAdvisors: 1,
                    aumBreakUp: [
                        {
                            totalUserAmount: 23944.64,
                            product_type: 'BOND',
                        },
                    ],
                    monthwiseTransactionCounts: [
                        {
                            count: 23,
                            month: 1,
                        },
                        {
                            count: 1,
                            month: 2,
                        },
                        {
                            count: 20,
                            month: 9,
                        },
                        {
                            count: 299,
                            month: 10,
                        },
                        {
                            count: 149,
                            month: 11,
                        },
                        {
                            count: 350,
                            month: 12,
                        },
                    ],
                    monthwiseCustomerCounts: [
                        {
                            count: 24,
                            month: 1,
                        },
                        {
                            count: 16,
                            month: 8,
                        },
                        {
                            count: 85,
                            month: 9,
                        },
                        {
                            count: 37,
                            month: 10,
                        },
                        {
                            count: 288,
                            month: 11,
                        },
                        {
                            count: 303,
                            month: 12,
                        },
                    ],
                    monthwiseAdvisorCounts: [
                        {
                            count: 59,
                            month: 1,
                        },
                        {
                            count: 7,
                            month: 8,
                        },
                        {
                            count: 6,
                            month: 9,
                        },
                        {
                            count: 6,
                            month: 10,
                        },
                        {
                            count: 7,
                            month: 11,
                        },
                        {
                            count: 120,
                            month: 12,
                        },
                    ],
                },
            },
        },
        {
            method: 'POST',
            path: '/users/bank-account',
            title: 'Creare a posts IFA bank account details',
            description: 'This endpoint allows you to Creare a posts IFA bank account details.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'name',
                    type: 'string',
                    description: 'name of the bank.',
                },
                {
                    name: 'name',
                    type: 'string',
                    description: 'account number.',
                },
                {
                    name: 'ifsc_code',
                    type: 'string',
                    description: 'Bank IFSC code.',
                },
                {
                    name: 'address',
                    type: 'string',
                    description: 'address of bank.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/accounts/account_id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'name="8600800144"' \n
                --form 'number="moulesh Chavan"' \n
                --form 'ifsc_code="PUNB0002500"' \n
                --form 'address="Pune"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Bank account details are updated.',
            },
        },
        {
            method: 'GET',
            path: '/users/hours',
            title: 'Get all IFA based on time',
            description: 'This endpoint allows you to get all IFA based on time.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'hours',
                    type: 'number',
                    description: 'Give a hours as number to get data',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/users/hours' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'hours="3"' \n`,
            },
            response: {
                success: true,
                data: [
                    {
                        name: 'saket+2',
                        phone_code: '91',
                        phone_verified: false,
                        email: 'saket+2@gmail.com',
                        email_verified: false,
                        is_admin: false,
                        created_at: '2024-01-04T07:52:49.404Z',
                        updated_at: '2024-01-04T07:52:49.404Z',
                        id: '659663d11877a8adcd886fcf',
                    },
                    {
                        name: 'saket+1',
                        phone_code: '91',
                        phone_verified: false,
                        email: 'saket+1@gmail.com',
                        email_verified: false,
                        is_admin: false,
                        created_at: '2024-01-04T07:52:11.459Z',
                        updated_at: '2024-01-04T07:52:11.459Z',
                        id: '659663aba639a9ec6e2194fb',
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/users/:id',
            title: 'Get IFA details based on id',
            description: 'This endpoint allows you to Get IFA details based on id.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'id',
                    type: 'number',
                    description: 'IFA data as per ID ',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/users/:id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'id="3"' \n`,
            },
            response: {
                success: true,
                data: {
                    name: 'MOULESH DILIP CHAVAN',
                    phone_code: '91',
                    organization: 'ICMP000',
                    phone_verified: false,
                    email: 'mouleshchavan@gmail.com',
                    email_verified: false,
                    pan_number: 'AWMPC5469K',
                    referral_code: 'MOUL3005',
                    is_admin: false,
                    created_at: '2023-12-08T06:11:17.914Z',
                    updated_at: '2024-01-04T10:41:49.562Z',
                    address: 'Bavdhan',
                    city: 'Pune',
                    pin_code: '411052',
                    state: 'Maharashtra',
                    id: '6572b385b683246e9a844dfe',
                },
            },
        },
        {
            method: 'POST',
            path: '/users/:id',
            title: 'Update IFA details based on id',
            description: 'This endpoint allows you to update IFA details based on id.',
            optionalAttributes: [
                {
                    name: 'email',
                    type: 'string',
                    description: "User's email address .",
                },
                {
                    name: 'phone_number',
                    type: 'string',
                    description: "User's phone number.",
                },
                {
                    name: 'birth_date',
                    type: 'string',
                    description: "User's birth date.",
                },
                {
                    name: 'gender',
                    type: 'string',
                    description: "User's gender.",
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/users/:id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'birth_date=""' \n
                --form 'gender=""' \n
                --form 'email="mouleshchavan@gmail.com"' \n
                --form 'phone_number=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Profile updated successfully.',
            },
        },
        {
            method: 'POST',
            path: '/users/:id/address',
            title: 'Update IFA address details',
            description: 'This endpoint allows you to update IFA address details',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'address',
                    type: 'string',
                    description: "User's  address .",
                },
                {
                    name: 'city',
                    type: 'string',
                    description: 'city of user.',
                },
                {
                    name: 'pin_code',
                    type: 'string',
                    description: 'Pine code of city.',
                },
                {
                    name: 'state',
                    type: 'string',
                    description: "User's state.",
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/users/:id/address' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'address="Bavdhan"' \n
                --form 'city="Pune"' \n
                --form 'pin_code="411052"' \n
                --form 'state="Maharashtra"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Address updated successfully.',
            },
        },
    ],
};

export default usersResource;
