import { ApiResource } from 'src/constants/app.const';

const customersResource: ApiResource = {
    name: 'customers',
    path: '/docs/resources/partner/customers',
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
            title: 'List all customers',
            description:
                'This endpoint allows you to retrieve a paginated list of customers by account.',
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
                    total_count: 20,
                    collection: [
                        {
                            id: '656477482a27c1bca1bd5bb5',
                            name: 'Rahul Dravid',
                            phone_code: '91',
                            phone_number: '9999999999',
                            is_phone_verified: false,
                            email: 'rahul@example.com',
                            pan_number: 'LCRPS4593J',
                            gender: 'MALE',
                            income: '5',
                            birth_date: '3/11/2000',
                            demat_number: '1208160042551231',
                            address: 'bavdhan',
                            pincode: '121212',
                            locality: 'llll',
                            district: 'pune',
                            city: 'pune',
                            state: 'Maharashtra',
                            account_number: '309001352003',
                            ifsc_code: 'RATN0000088',
                            is_bank_verified: false,
                            created_at: '2023-11-27T11:02:32.666Z',
                            updated_at: '2023-11-29T05:15:00.777Z',
                        },
                    ],
                },
            },
        },
        {
            method: 'POST',
            path: '/customers',
            title: 'Onboard a customer',
            description: 'This endpoint allows you to complete customer onboarding journey',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'pan_number',
                    type: 'string',
                    description: 'PAN number of the customer.',
                },
                {
                    name: 'name',
                    type: 'string',
                    description: 'Name of the customer.',
                },
                {
                    name: 'email',
                    type: 'string',
                    description: 'Email address of the customer.',
                },
                {
                    name: 'phone_number',
                    type: 'string',
                    description: 'Phone number of the customer.',
                },
                {
                    name: 'demat_number',
                    type: 'string',
                    description: 'Demat account number of the customer.',
                },
                {
                    name: 'product_type',
                    type: 'enum',
                    description: 'Type of product for onboarding (enum: ProductType).',
                },
                {
                    name: 'income',
                    type: 'string',
                    description: 'Income information of the customer.',
                },
                {
                    name: 'gender',
                    type: 'string',
                    description: 'Gender of the customer.',
                },
                {
                    name: 'birth_date',
                    type: 'string',
                    description: 'Birth date of the customer.',
                },
                {
                    name: 'account_number',
                    type: 'string',
                    description: 'Bank account number of the customer.',
                },
                {
                    name: 'ifsc_code',
                    type: 'string',
                    description: 'IFSC code of the customer’s bank.',
                },
                {
                    name: 'address',
                    type: 'string',
                    description: 'Physical address of the customer.',
                },
                {
                    name: 'locality',
                    type: 'string',
                    description: 'Locality of the customer’s address.',
                },
                {
                    name: 'city',
                    type: 'string',
                    description: 'City or town of the customer’s address.',
                },
                {
                    name: 'state',
                    type: 'string',
                    description: 'State in which the customer resides.',
                },
                {
                    name: 'country',
                    type: 'string',
                    description: 'Country in which the customer resides.',
                },
                {
                    name: 'pincode',
                    type: 'string',
                    description: 'PIN code or postal code of the customer’s address.',
                },
                {
                    name: 'phone_code',
                    type: 'string',
                    description: 'Phone code of the customer.',
                },
                {
                    name: 'type',
                    type: 'string',
                    description: 'Type of customer.',
                },
                {
                    name: 'location',
                    type: 'string',
                    description: 'Location of the customer.',
                },
                {
                    name: 'pan_attachment',
                    type: 'file',
                    description: 'Pan copy of the customer.',
                },
                {
                    name: 'address_attachment',
                    type: 'file',
                    description: 'Address copy of the customer.',
                },
                {
                    name: 'cancelled_cheque_attachment',
                    type: 'file',
                    description: 'Cancelled Cheque of the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/customers' \n
                --header 'Authorization: Bearer {api_token}' \n
                --form 'pan_number="LCRPS4593Y"' \n
                --form 'name="partner jay2"' \n
                --form 'email="jay.sharma+6366127@incredmoney.com"' \n
                --form 'phone_number="8769009988"' \n
                --form 'demat_number="1208160042551231"' \n
                --form 'product_type="BOND"' \n
                --form 'income="5"' \n
                --form 'gender="MALE"' \n
                --form 'birth_date="3/11/2000"' \n
                --form 'account_number="309001352003"' \n
                --form 'ifsc_code="RATN0000088"' \n
                --form 'address="bavdhan"' \n
                --form 'locality="llllll"' \n
                --form 'city="eww"' \n
                --form 'state="Maharashtra"' \n
                --form 'country="India"' \n
                --form 'pincode="121212"' \n
                --form 'phone_code="91"' \n
                --form 'type="orobonds"' \n
                --form 'location="ewrwr"' \n
                --form 'pan_attachment=@"/home/jay/Downloads/Assignment.pdf"' \n
                --form 'address_attachment=@"/home/jay/Downloads/Pranshu Resume.pdf"' \n
                --form 'cancelled_cheque_attachment=@"/home/jay/Downloads/RepShow.pdf"'`,
            },
            response: {
                data: {
                    id: '656477482a27c1bca1bd5bb5',
                    name: 'Rahul Dravid',
                    phone_code: '91',
                    phone_number: '9999999999',
                    is_phone_verified: false,
                    email: 'rahul@example.com',
                    pan_number: 'LCRPS4593J',
                    gender: 'MALE',
                    income: '5',
                    birth_date: '3/11/2000',
                    demat_number: '1208160042551231',
                    address: 'bavdhan',
                    pincode: '121212',
                    locality: 'llll',
                    district: 'pune',
                    city: 'pune',
                    state: 'Maharashtra',
                    account_number: '309001352003',
                    ifsc_code: 'RATN0000088',
                    is_bank_verified: false,
                    created_at: '2023-11-27T11:02:32.666Z',
                    updated_at: '2023-11-29T05:15:00.777Z',
                },
                success: true,
                message: 'Customer onboarding successful',
            },
        },
        {
            method: 'GET',
            path: '/customers/:id',
            title: 'Get a customer',
            description: 'This endpoint allows you to retrieve a customer by id.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'id',
                    type: 'string',
                    description: 'Unique identifier for the customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/customers/{id}' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: [
                    {
                        id: '656477482a27c1bca1bd5bb5',
                        name: 'Rahul Dravid',
                        phone_code: '91',
                        phone_number: '9999999999',
                        is_phone_verified: false,
                        email: 'rahul@example.com',
                        pan_number: 'LCRPS4593J',
                        gender: 'MALE',
                        income: '5',
                        birth_date: '3/11/2000',
                        demat_number: '1208160042551231',
                        address: 'bavdhan',
                        pincode: '121212',
                        locality: 'llll',
                        district: 'pune',
                        city: 'pune',
                        state: 'Maharashtra',
                        account_number: '309001352003',
                        ifsc_code: 'RATN0000088',
                        is_bank_verified: false,
                        created_at: '2023-11-27T11:02:32.666Z',
                        updated_at: '2023-11-29T05:15:00.777Z',
                    },
                ],
            },
        },
        {
            method: 'PATCH',
            path: '/customers/:id',
            title: 'Update a customer',
            description: 'This endpoint allows you to update customer details',
            optionalAttributes: [
                // {
                //     name: 'phone_number',
                //     type: 'string',
                //     description: 'Phone number of the customer when not KYC verified.',
                // },
                {
                    name: 'pan_number',
                    type: 'string',
                    description: 'PAN of the customer when not KYC verified.',
                },
                {
                    name: 'gender',
                    type: 'string',
                    description: 'Gender of the customer.',
                },
                {
                    name: 'income',
                    type: 'string',
                    description: 'Income information of the customer.',
                },
                {
                    name: 'birth_date',
                    type: 'string',
                    description: 'Birth date of the customer.',
                },
                {
                    name: 'demat_number',
                    type: 'string',
                    description: 'Demat account number of the customer.',
                },
                {
                    name: 'account_number',
                    type: 'string',
                    description: 'Bank account number of the customer.',
                },
                {
                    name: 'account_type',
                    type: 'string',
                    description: 'Bank account type of customer.',
                },
                {
                    name: 'ifsc_code',
                    type: 'string',
                    description: 'IFSC code of the customer’s bank.',
                },
                {
                    name: 'address',
                    type: 'string',
                    description: 'Physical address of the customer.',
                },
                {
                    name: 'locality',
                    type: 'string',
                    description: 'Locality of the customer’s address.',
                },
                {
                    name: 'city',
                    type: 'string',
                    description: 'City or town of the customer’s address.',
                },
                {
                    name: 'state',
                    type: 'string',
                    description: 'State in which the customer resides.',
                },
                {
                    name: 'country',
                    type: 'string',
                    description: 'Country in which the customer resides.',
                },
                {
                    name: 'pincode',
                    type: 'string',
                    description: 'PIN code or postal code of the customer’s address.',
                },
                {
                    name: 'location',
                    type: 'string',
                    description: 'Location of the customer.',
                },
                {
                    name: 'PAN',
                    type: 'file',
                    description: 'Pan copy of the customer.',
                },
                {
                    name: 'ADDRESS',
                    type: 'file',
                    description: 'Address copy of the customer.',
                },
                {
                    name: 'CANCELLED_CHEQUE',
                    type: 'file',
                    description: 'Cancelled Cheque of the customer.',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request PATCH '{base_url}/customers/{id}' \n
                --header 'Authorization: Bearer {api_token}' \n
                --form 'phone_number="8769009988"' \n
                --form 'pan_number="LCRPS4593Y"' \n
                --form 'gender="MALE"' \n
                --form 'income="5"' \n
                --form 'birth_date="3/11/2000"' \n
                --form 'demat_number="1208160042551231"' \n
                --form 'account_number="309001352003"' \n
                --form 'account_type="Savings"' \n
                --form 'ifsc_code="RATN0000088"' \n
                --form 'address="jaipu"' \n
                --form 'locality="llllll"' \n
                --form 'city="eww"' \n
                --form 'state="Maharashtra"' \n
                --form 'country="India"' \n
                --form 'pincode="121212"' \n
                --form 'location="ewrwr"' \n
                --form 'pan_attachment=@"/home/jay/Downloads/Assignment.pdf"' \n
                --form 'address_attachment=@"/home/jay/Downloads/Pranshu Resume.pdf"' \n
                --form 'cancelled_cheque_attachment=@"/home/jay/Downloads/RepShow.pdf"'`,
            },
            response: {
                success: true,
                data: {
                    id: '656477482a27c1bca1bd5bb5',
                    name: 'Rahul Dravid',
                    phone_code: '91',
                    phone_number: '9999999999',
                    is_phone_verified: false,
                    email: 'rahul@example.com',
                    pan_number: 'LCRPS4593J',
                    gender: 'MALE',
                    income: '5',
                    birth_date: '3/11/2000',
                    demat_number: '1208160042551231',
                    address: 'bavdhan',
                    pincode: '121212',
                    locality: 'llll',
                    district: 'pune',
                    city: 'pune',
                    state: 'Maharashtra',
                    account_number: '309001352003',
                    ifsc_code: 'RATN0000088',
                    is_bank_verified: false,
                    created_at: '2023-11-27T11:02:32.666Z',
                    updated_at: '2023-11-29T05:15:00.777Z',
                },
                message: 'Customer successfully updated',
            },
        },
    ],
};

export default customersResource;
