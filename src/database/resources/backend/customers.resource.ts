import { ApiResource } from 'src/constants/app.const';

const customersResource: ApiResource = {
    name: 'customers',
    path: '/docs/resources/backend/customers',
    description:
        'Through these APIs, customers can effortlessly register and onboard onto the platform, providing essential information such as personal details, kyc documents, and bank details. Once registered, customers are strategically assigned to specific accounts, either based on predetermined criteria or personal preferences, ensuring a tailored and effective advisory relationship.',
    title: 'The customer model',
    subtitle:
        'This database model defines the structure for customer information in our investment platform. Each customer is identified by a unique document ID, and their status in the onboarding process is tracked. Contact details like phone number and email are stored, with indicators for phone verification. Personal and financial information, including PAN number, gender, income, and birth date, is captured. Demat and address details, along with banking information, ensure a comprehensive profile. Customers can be categorized and tagged for easy navigation in the user interface. Access tokens and security measures, like API tokens and consent secrets, provide authentication. The model also establishes relationships with an advisor and an account. Overall, this model ensures a robust representation of customer data, facilitating a smooth and secure investment experience.',
    properties: [
        {
            name: 'id',
            type: 'string',
            description: 'Unique identifier for the customer.',
        },
        {
            name: 'name',
            type: 'string',
            description: 'This field stores the customer name',
        },
        {
            name: 'status',
            type: 'string',
            description:
                'This field indicates the current status of the customer within the onboarding process.',
        },
        {
            name: 'phone_number',
            type: 'string',
            description: 'The phone number for the customer.',
        },
        {
            name: 'is_phone_verified',
            type: 'boolean',
            description:
                'boolean flag indicating whether the customer phone number has been verified.',
        },
        {
            name: 'email',
            type: 'string',
            description: 'The email for the customer.',
        },
        {
            name: 'pan_number',
            type: 'string',
            description: 'Customer PAN (Permanent Account Number)..',
        },
        {
            name: 'gender',
            type: 'string',
            description: 'Enum field representing the customer gender.',
        },
        {
            name: 'income',
            type: 'string',
            description: 'The customer income range.',
        },
        {
            name: 'birth_date',
            type: 'string',
            description: 'Stores the customer date of birth.',
        },
        {
            name: 'demat_number',
            type: 'string',
            description: 'The customer demat account number.',
        },

        {
            name: 'address',
            type: 'string',
            description: 'The customer’s physical address details.',
        },
        {
            name: 'state',
            type: 'string',
            description: 'The state in which the customer resides.',
        },
        {
            name: 'pincode',
            type: 'string',
            description: 'The PIN code or postal code of the customer’s address.',
        },
        {
            name: 'country',
            type: 'string',
            description: 'The country in which the customer resides.',
        },
        {
            name: 'locality',
            type: 'string',
            description: 'The locality or neighborhood of the customer’s address.',
        },
        {
            name: 'city',
            type: 'string',
            description: 'The city in which the customer resides.',
        },
        {
            name: 'city',
            type: 'string',
            description: 'The city or town of the customer’s address.',
        },
        {
            name: 'account_type',
            type: 'string',
            description: 'The type of the customer’s bank account.',
        },
        {
            name: 'account_number',
            type: 'string',
            description: 'The customer’s bank account number.',
        },
        {
            name: 'ifsc_code',
            type: 'string',
            description: 'The IFSC code associated with the customer’s bank.',
        },
        {
            name: 'is_bank_verified',
            type: 'boolean',
            description:
                'A boolean flag indicating whether the customer’s bank details have been verified.',
        },
    ],
    endpoints: [
        {
            method: 'GET',
            path: '/customers',
            title: 'Get customers of IFA',
            description: 'This endpoint allows you to retrieve a paginated list customers of IFA.',
            optionalAttributes: [
                {
                    name: 'name',
                    type: 'string',
                    description: 'Name of the customer.',
                },
                {
                    name: 'status',
                    type: 'string',
                    description: 'Filters the customers based on the status.',
                },
                {
                    name: 'account_id',
                    type: 'ObjectId',
                    description: 'Get the customers based on the account_id.',
                },
                {
                    name: 'page',
                    type: 'number',
                    description: 'Page cursor for pagination.',
                },
                {
                    name: 'per_page',
                    type: 'number',
                    description: 'Twenty customers are shown per page by default.',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/customers' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    total_count: 10,
                    collection: [
                        {
                            id: '65814858abb7a2a0e265cfe4',
                            created_at: '2023-12-19T07:38:00.674Z',
                            email: 'mouleshchavan94@gmail.com',
                            is_consent_given: false,
                            name: 'MOULESH DILIP CHAVAN',
                            pan_number: 'AWMPC5469K',
                            phone_code: '91',
                            phone_number: '8600800144',
                            status: 'MIN_KYC_VERIFIED',
                            updated_at: '2023-12-28T12:50:29.391Z',
                        },
                        {
                            id: '65814858abb7a2a0e265cfe4',
                            created_at: '2023-12-19T07:38:00.674Z',
                            email: 'mouleshchavan94@gmail.com',
                            is_consent_given: false,
                            name: 'MOULESH DILIP CHAVAN',
                            pan_number: 'AWMPC5469K',
                            phone_code: '91',
                            phone_number: '8600800144',
                            status: 'MIN_KYC_VERIFIED',
                            updated_at: '2023-12-28T12:50:29.391Z',
                        },
                    ],
                },
            },
        },
        {
            method: 'GET',
            path: '/customers/hours',
            title: 'Get all customers based on time',
            description: 'This endpoint allows you to Get all customers based on time',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'hours',
                    type: 'number',
                    description: 'Get the custome based on time',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/customers'/hours \n
                --header 'Authorization: Bearer {api_token}' \n`,
            },
            response: {
                data: {
                    roles: [],
                    is_first_contact: true,
                    customer_id: '658e5b0b7d22ae8fcb6a9c32',
                    user_id: '6543268a5f62f129309157d0',
                    account_id: '65574c5e3645875325161d27',
                    created_at: '2023-12-29T05:37:15.703Z',
                    updated_at: '2023-12-29T05:37:15.703Z',
                    customer: {
                        name: 'PRASHANT BHAGVANTA NAVALE',
                        status: 'KYC_SUBMITTED',
                        phone_code: '91',
                        phone_number: '9764176147',
                        is_phone_verified: false,
                        email: 'prashant.navale+123@incredmoney.com',
                        pan_number: 'AFNPN3921M',
                        is_bank_verified: false,
                        is_penny_dropped: false,
                        remarks: [],
                        labels: [],
                        tags: [],
                        is_consent_given: false,
                        is_whatsapp_given: false,
                        foreign_id: '658e5b0bc48886c69c76eed3',
                        created_at: '2023-12-29T05:37:15.691Z',
                        updated_at: '2023-12-29T05:54:16.861Z',
                        account_number: '00000000001',
                        birth_date: '2000-01-01',
                        demat_number: '1204160012121212',
                        gender: 'MALE',
                        ifsc_code: 'SBIN0011513',
                        income: '5',
                        address: 'Pune',
                        city: 'Pune',
                        country: 'IN',
                        locality: 'Pune',
                        pincode: '111111',
                        state: 'Maharashtra',
                        id: '658e5b0b7d22ae8fcb6a9c32',
                    },
                    advisor: {
                        name: 'VIKRAM CHAGANLAL MALVIYA',
                        id: '6543268a5f62f129309157d0',
                    },
                    account: {
                        code: 'ICMP000',
                        id: '65574c5e3645875325161d27',
                    },
                    id: '658e5b0b7d22ae8fcb6a9c34',
                },
                success: true,
            },
        },
        {
            method: 'POST',
            path: '/customers',
            title: 'Create a customer',
            description: 'This endpoint allows you to create a customer.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'pan_number',
                    type: 'string',
                    description: 'Pan number of customer.',
                },
                {
                    name: 'name',
                    type: 'string',
                    description: 'Name of the customer.',
                },
                {
                    name: 'email',
                    type: 'string',
                    description: 'UEmail of the customer.',
                },
                {
                    name: 'phone_number',
                    type: 'string',
                    description: 'Phone number of the customer.',
                },
                {
                    name: 'demat_number',
                    type: 'string',
                    description: 'Demat number of the customer.',
                },
                {
                    name: 'product_type',
                    type: 'enum ',
                    description: 'Produce type. Enum(BOND,MLD,IPO)',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'pan_number=""' \n
                --data 'name=""'\n
                --data 'email='\n
                --data 'phone_number=' \n
                --data 'demat_number='\n
                --data 'product_type='\n`,
            },
            response: {
                success: true,
                data: {
                    name: 'Moulesh Chavan',
                    status: 'BASIC_DETAILS_ENTERED',
                    phone_code: '91',
                    phone_number: '8600800144',
                    is_phone_verified: false,
                    email: 'mouleshchavan@gmail.com',
                    pan_number: 'AWMPC5469K',
                    demat_number: '1208160042551231',
                    is_bank_verified: false,
                    is_penny_dropped: false,
                    remarks: [],
                    labels: [],
                    tags: [],
                    is_consent_given: false,
                    is_whatsapp_given: false,
                    foreign_id: '6572b3857dbadfb98f3ab541',
                    created_at: '2023-12-29T06:37:54.450Z',
                    updated_at: '2023-12-29T06:37:54.450Z',
                    id: '658e69425e0e1a41b29c9563',
                },
                message: 'Customer successfully created.',
            },
        },
        {
            method: 'POST',
            path: '/customers/invite',
            title: 'Sends email invite to Customer',
            description: 'This endpoint allows you to Sends email invite to Customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'pan_number',
                    type: 'string',
                    description: 'Pan number of customer.',
                },
                {
                    name: 'name',
                    type: 'string',
                    description: 'Name of the customer.',
                },
                {
                    name: 'email',
                    type: 'string',
                    description: 'UEmail of the customer.',
                },
                {
                    name: 'phone_number',
                    type: 'string',
                    description: 'Phone number of the customer.',
                },
                {
                    name: 'phone_code',
                    type: 'number',
                    description: 'Phone code of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/invite' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'pan_number=""' \n
                --data 'name=""'\n
                --data 'email='\n
                --data 'phone_number=' \n
                --data 'phone_code='\n`,
            },
            response: {
                success: true,
                data: {
                    name: 'Moulesh Chavan',
                    status: 'BASIC_DETAILS_ENTERED',
                    phone_code: '91',
                    phone_number: '8600800144',
                    is_phone_verified: false,
                    email: 'mouleshchavan@gmail.com',
                    pan_number: 'AWMPC5469K',
                    demat_number: '1208160042551231',
                    is_bank_verified: false,
                    is_penny_dropped: false,
                    remarks: [],
                    labels: [],
                    tags: [],
                    is_consent_given: false,
                    is_whatsapp_given: false,
                    foreign_id: '6572b3857dbadfb98f3ab541',
                    created_at: '2023-12-29T06:37:54.450Z',
                    updated_at: '2023-12-29T06:37:54.450Z',
                    id: '658e69425e0e1a41b29c9563',
                },
                message: 'Customer invitation has been sent to mouleshchavan@gmail.com.',
            },
        },
        {
            method: 'POST',
            path: '/customers/consent-otp',
            title: 'Sends Consent OTP for customer',
            description: 'This endpoint allows you to Sends Consent OTP for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'phone_number',
                    type: 'string',
                    description: 'Phone number of customer.',
                },
                {
                    name: 'phone_code',
                    type: 'string',
                    description: 'Phone code of the customer.',
                },
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'Customer id of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/consent-otp' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n
                --data 'phone_number=' \n
                --data 'phone_code='\n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Otp Sent.',
            },
        },
        {
            method: 'POST',
            path: '/customers/verify-consent-otp',
            title: 'Verify consent otp for customer',
            description: 'This endpoint allows you to Verify consent otp for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer id of customer.',
                },
                {
                    name: 'phone_otp',
                    type: 'string',
                    description: 'phone otp of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/consent-otp' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n
                --data 'phone_otp=' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Consent Given Successfully',
            },
        },
        {
            method: 'POST',
            path: '/customers/whatsapp-consent',
            title: 'Verify whatsapp consent otp for customer',
            description: 'This endpoint allows you to Verify whatsapp consent otp for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'is_whatsapp_consent',
                    type: 'boolean',
                    description: 'Whatsapp consent true or false.',
                },
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/whatsapp-consent' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n
                --data 'is_whatsapp_consent=' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Consent Given Successfully',
            },
        },
        {
            method: 'POST',
            path: '/customers/send-consent',
            title: 'Send User the consent link',
            description: 'This endpoint allows you to Send User the consent link for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/send-consent' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Consent link has been sent to the customer',
            },
        },
        {
            method: 'POST',
            path: '/customers/validate-pan',
            title: 'validates customer pan and returns customer details',
            description: 'This endpoint allows you to Send User the consent link for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'pan_number',
                    type: 'string',
                    description: 'pan_number of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/validate-pan' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'validate-pan=""' \n`,
            },
            response: {
                success: true,
                data: {
                    name: 'MOULESH DILIP CHAVAN',
                    status: 'MIN_KYC_VERIFIED',
                    phone_code: '91',
                    phone_number: '8600800144',
                    is_phone_verified: false,
                    email: 'mouleshchavan94@gmail.com',
                    pan_number: 'AWMPC5469K',
                    is_bank_verified: false,
                    is_penny_dropped: false,
                    remarks: [],
                    labels: [],
                    tags: [],
                    is_consent_given: false,
                    is_whatsapp_given: false,
                    foreign_id: '65814858a2904c5670181d50',
                    created_at: '2023-12-19T07:38:00.674Z',
                    updated_at: '2023-12-28T12:50:29.391Z',
                    upi_id: '8600800144@ybl',
                    icmb_cust_id: 'OB1228230862',
                    id: '65814858abb7a2a0e265cfe4',
                },
                message: '',
            },
        },
        {
            method: 'POST',
            path: '/customers/get-verification-token',
            title: 'Sends verification token for bank verification',
            description:
                'This endpoint allows you to Sends verification token for bank verification for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
                {
                    name: 'income',
                    type: 'string',
                    description: 'income of the customer.',
                },
                {
                    name: 'gender',
                    type: 'string',
                    description: 'gender of the customer.',
                },
                {
                    name: 'birth_date',
                    type: 'string',
                    description: 'birth_date of the customer.',
                },
                {
                    name: 'demat_number',
                    type: 'string',
                    description: 'demat_number of the customer.',
                },
                {
                    name: 'account_number',
                    type: 'string',
                    description: 'account_number of the customer.',
                },
                {
                    name: 'ifsc_code',
                    type: 'string',
                    description: 'ifsc_code of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/get-verification-token' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n
                --data 'income=""' \n
                --data 'gender=""' \n
                --data 'birth_date=""' \n
                --data 'demat_number=""' \n
                --data 'account_number=""' \n
                --data 'ifsc_code=""' \n`,
            },
            response: {
                success: true,
                data: {
                    request_id: '6594f7bc5b23840fdb7e64a5',
                },
                message: '',
            },
        },
        {
            method: 'POST',
            path: '/customers/penny-drop-status',
            title: 'Send the penny drop status during bank verification',
            description:
                'This endpoint allows you to Send the penny drop status during bank verification for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
                {
                    name: 'request_id',
                    type: 'string',
                    description: 'request_id of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/get-verification-token' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n
                --data 'request_id=""' \n`,
            },
            response: {
                success: true,
                data: {
                    status: 'pending',
                },
                message: 'Account not yet verified',
            },
        },
        {
            method: 'GET',
            path: '/customers/sync',
            title: 'Sync all IFA customers detail from B2C database',
            description:
                'This endpoint allows you to Sync all IFA customers detail from B2C database for customer',
            optionalAttributes: [],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/sync' \n
                --header 'Authorization: Bearer {api_token}'\n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Customers synced successfully',
            },
        },
        {
            method: 'POST',
            path: '/customers/:id/accept-reject-kyc',
            title: 'Accept and reject KYC for the custmore',
            description:
                'This endpoint allows you to Sync all IFA customers detail from B2C database for customer',
            optionalAttributes: [
                {
                    name: 'type',
                    type: 'string',
                    description: 'type of the customer for KYC.',
                },
                {
                    name: 'remarks',
                    type: 'string',
                    description: 'remarks of the customer for KYC.',
                },
            ],
            requiredAttributes: [
                {
                    name: 'action',
                    type: 'string',
                    description: 'action of the customer for KYC.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/:id/accept-reject-kyc' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'action=""' \n
                --data 'type=""' \n
                --data 'remarks=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'KYC updated',
            },
        },
        {
            method: 'GET',
            path: '/customers/:customer_id/portfolio',
            title: 'portfolio for the custmore',
            description: 'This endpoint allows you to portfolio for customer',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer for.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/:customer_id/portfolio' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: '',
            },
        },
        {
            method: 'POST',
            path: '/customers/:id/confirm-consent',
            title: 'Send custmores docs to Admin',
            description: 'This endpoint allows you to Send custmores docs to Admin',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer for.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/:id/confirm-consent' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Confirmation sent successfully',
            },
        },
        {
            method: 'POST',
            path: '/customers/:id/upload',
            title: 'Upload customer document.',
            description: 'This endpoint allows you to Upload customer document.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
                {
                    name: 'type',
                    type: 'string',
                    description: 'Attachment type of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/:id/upload' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'File uploaded successfully',
            },
        },
        {
            method: 'GET',
            path: '/customers/:id/sync',
            title: 'Sync customer detail from B2C..',
            description: 'This endpoint allows you to Sync customer detail from B2C..',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/:id/sync' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Customer synced successfully.',
            },
        },
        {
            method: 'GET',
            path: '/customers/:id',
            title: 'Returns customer details',
            description: 'This endpoint allows you to Returns customer details',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/:id' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'customer_id=""' \n`,
            },
            response: {
                success: true,
                data: {
                    name: 'Moulesh Chavan',
                    status: 'KYC_SUBMITTED',
                    phone_code: '91',
                    phone_number: '8600800144',
                    is_phone_verified: false,
                    email: 'mouleshchavan@gmail.com',
                    pan_number: 'AWMPC5469K',
                    demat_number: '1208160042551231',
                    is_bank_verified: false,
                    is_penny_dropped: false,
                    remarks: [],
                    labels: [],
                    tags: [],
                    is_consent_given: true,
                    is_whatsapp_given: false,
                    foreign_id: '6572b3857dbadfb98f3ab541',
                    created_at: '2023-12-29T06:37:54.450Z',
                    updated_at: '2024-01-03T06:16:44.476Z',
                    income: '150000',
                    attachments: [],
                    id: '658e69425e0e1a41b29c9563',
                },
                message: 'Customer synced successfully.',
            },
        },
        {
            method: 'PATCH',
            path: '/customers/:id',
            title: 'Returns customer details',
            description: 'This endpoint allows you to Returns customer details',
            optionalAttributes: [
                {
                    name: 'income',
                    type: 'string',
                    description: 'income of the customer.',
                },
                {
                    name: 'gender',
                    type: 'string',
                    description: 'gender of the customer.',
                },
                {
                    name: 'birth_date',
                    type: 'string',
                    description: 'birth_date of the customer.',
                },
                {
                    name: 'address',
                    type: 'string',
                    description: 'address of the customer.',
                },
                {
                    name: 'locality',
                    type: 'string',
                    description: 'locality of the customer.',
                },
                {
                    name: 'city',
                    type: 'string',
                    description: 'city of the customer.',
                },
                {
                    name: 'state',
                    type: 'string',
                    description: 'state of the customer.',
                },
                {
                    name: 'country',
                    type: 'string',
                    description: 'country of the customer.',
                },
                {
                    name: 'pincode',
                    type: 'string',
                    description: 'pincode of the customer.',
                },
                {
                    name: 'bank_account_no',
                    type: 'string',
                    description: 'bank_account_no of the customer.',
                },
                {
                    name: 'ifsc_code',
                    type: 'string',
                    description: 'ifsc_code of the customer.',
                },
                {
                    name: 'phone_code',
                    type: 'string',
                    description: 'phone_code of the customer.',
                },
                {
                    name: 'pincode',
                    type: 'string',
                    description: 'pincode of the customer.',
                },
                {
                    name: 'is_whatsapp_given',
                    type: 'string',
                    description: 'is_whatsapp_given of the customer.',
                },
            ],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'customer_id of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers/:id' \n
                --header 'Authorization: Bearer {api_token}'\n
                --data 'income=""' \n
                --data 'gender=""' \n
                --data 'birth_date=""' \n
                --data 'demat_number=""' \n
                --data 'address=""' \n
                --data 'locality=""' \n
                --data 'city=""' \n
                --data 'state=""' \n
                --data 'country=""' \n
                --data 'pincode=""' \n
                --data 'bank_account_no=""' \n
                --data 'ifsc_code=""' \n
                --data 'phone_code=""' \n
                --data 'is_whatsapp_given=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Customer updated successfully.',
            },
        },
    ],
};

export default customersResource;
