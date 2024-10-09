import { ApiResource } from 'src/constants/app.const';

const ordersResource: ApiResource = {
    name: 'orders',
    path: '/docs/resources/partner/orders',
    description:
        'Orders APIs represent a set of endpoints that facilitate the management and tracking of financial transactions within the system. These APIs enable functionalities related to the initiation, processing, and retrieval of information about orders made by users for financial products',
    title: 'The Order model',
    subtitle:
        'The Order model represents a financial transaction related to the purchase of a financial product. It includes details about the order, customer, product, and additional metadata.',
    properties: [
        {
            name: 'id',
            type: 'string',
            description: 'Unique identifier for the order.',
        },
        {
            name: 'type',
            type: 'string',
            description: 'Type of the order (e.g., purchase).',
        },
        {
            name: 'status',
            type: 'string',
            description: 'Current status of the order.',
        },
        {
            name: 'units',
            type: 'number',
            description: 'Number of units associated with the order.',
        },
        {
            name: 'return_rate',
            type: 'number',
            description: 'Amount of return_rate associated with the order.',
        },
        {
            name: 'unit_price',
            type: 'number',
            description: 'Unit price of the product associated with the order.',
        },
        {
            name: 'user_amount',
            type: 'number',
            description: 'Amount paid by the user for the order.',
        },
        {
            name: 'is_consent_given',
            type: 'boolean',
            description: 'Flag indicating whether the customer has given consent.',
        },
        {
            name: 'demat_number',
            type: 'string',
            description: 'Demat number associated with the order.',
        },
        {
            name: 'dp_name',
            type: 'string',
            description: 'Depository participant name associated with the order.',
        },
        {
            name: 'customer_email',
            type: 'string',
            description: 'Email of the customer making the order.',
        },
        {
            name: 'customer_name',
            type: 'string',
            description: 'Name of the customer making the order.',
        },
        {
            name: 'product_code',
            type: 'string',
            description: 'Product code associated with the order.',
        },
        {
            name: 'product_name',
            type: 'string',
            description: 'Name of the product associated with the order.',
        },
        {
            name: 'product_isin',
            type: 'string',
            description: 'ISIN of the product associated with the order.',
        },
        {
            name: 'product_type',
            type: 'string',
            description: 'Type of the product associated with the order.',
        },
        {
            name: 'product_issuer',
            type: 'string',
            description: 'Issuer of the product associated with the order.',
        },
        {
            name: 'customer_id',
            type: 'string',
            description: 'Unique identifier for the customer associated with the order.',
        },
        {
            name: 'advisor_id',
            type: 'string',
            description: 'Unique identifier for the advisor associated with the order.',
        },
        {
            name: 'account_id',
            type: 'string',
            description: 'Unique identifier for the account associated with the order.',
        },
        {
            name: 'created_at',
            type: 'string',
            description: 'Order creation date.',
        },
        {
            name: 'updated_at',
            type: 'string',
            description: 'Order updated date.',
        },
    ],
    endpoints: [
        {
            method: 'GET',
            path: '/orders',
            title: 'List all orders',
            description:
                'This endpoint allows you to retrieve a paginated list of all your orders. By default, a maximum of ten customers are shown per page.',
            optionalAttributes: [
                {
                    name: 'status',
                    type: 'string',
                    description: 'filters the orders based on the status.',
                },
                {
                    name: 'page',
                    type: 'number',
                    description: 'filters data using pagination.',
                },
                {
                    name: 'per_page',
                    type: 'number',
                    description: 'Twenty orders are shown per page by default.',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/orders' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    total_count: 20,
                    collection: [
                        {
                            id: '656d79d565c6840eab8de6d1',
                            type: 'purchase',
                            status: 'Order Initiated',
                            units: 2,
                            unit_price: 70629.423753125,
                            user_amount: 141258.84750625,
                            is_consent_given: false,
                            demat_number: '1208160012312312',
                            dp_name: 'ZERODHA BROKING LIMITED',
                            customer_email: 'rahul.chandra@incredmoney.com',
                            customer_name: 'RAHUL CHANDRA NIRMALA',
                            product_code: 'keertana2',
                            product_name: 'Keertana Finserv Private Limited',
                            product_isin: 'INE0NES07030-2',
                            product_type: 'BOND',
                            product_issuer: 'Keertana Finserv Private Limited',
                            customer_id: '64eddd1a5c120a5406b3a43f',
                            advisor_id: '64cce8641ba21d7aedba7628',
                            account_id: '65574c5e3645875325161d11',
                            created_at: '2023-12-04T07:03:49.785Z',
                            updated_at: '2023-12-07T05:38:21.911Z',
                        },
                    ],
                },
            },
        },
        {
            method: 'POST',
            path: '/orders',
            title: 'Create a order',
            description:
                'This endpoint allows you to create a order and responds with a order link to make the transaction.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'The customer id for whom you want to transact for.',
                },
                {
                    name: 'product_isin',
                    type: 'string',
                    description: 'The product ISIN to make order for.',
                },
                {
                    name: 'units',
                    type: 'number',
                    description: 'Number of product units.',
                },
                {
                    name: 'return_rate',
                    type: 'number',
                    description: 'Amount of return_rate.',
                },
                {
                    name: 'is_consent_given',
                    type: 'boolean',
                    description: 'The consent from the customer to proceed with the order.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/orders' \n
                --header 'Authorization: Bearer {api_token}' \n
                --data 'customer_id=""' \n
                --data 'product_isin=""' \n
                --data 'units=10' \n
                --data 'return_rate=12' \n
                --data 'is_consent_given=true'`,
            },
            response: {
                success: true,
                data: [
                    {
                        id: '656d79d565c6840eab8de6d1',
                        type: 'purchase',
                        status: 'Order Initiated',
                        units: 2,
                        unit_price: 70629.423753125,
                        user_amount: 141258.84750625,
                        is_consent_given: false,
                        demat_number: '1208160012312312',
                        dp_name: 'ZERODHA BROKING LIMITED',
                        customer_email: 'rahul.chandra@incredmoney.com',
                        customer_name: 'RAHUL CHANDRA NIRMALA',
                        product_code: 'keertana2',
                        product_name: 'Keertana Finserv Private Limited',
                        product_isin: 'INE0NES07030-2',
                        product_type: 'BOND',
                        product_issuer: 'Keertana Finserv Private Limited',
                        customer_id: '64eddd1a5c120a5406b3a43f',
                        advisor_id: '64cce8641ba21d7aedba7628',
                        account_id: '65574c5e3645875325161d11',
                        created_at: '2023-12-04T07:03:49.785Z',
                        updated_at: '2023-12-07T05:38:21.911Z',
                        payment_link: '',
                    },
                ],
            },
        },
        {
            method: 'GET',
            path: '/orders/:id',
            title: 'Get a order',
            description: 'This endpoint allows you to retrieve a specific order using its id.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'id',
                    type: 'string',
                    description: 'Unique identifier for the order.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/orders/{id}' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    id: '656d79d565c6840eab8de6d1',
                    type: 'purchase',
                    status: 'Order Initiated',
                    units: 2,
                    unit_price: 70629.423753125,
                    user_amount: 141258.84750625,
                    is_consent_given: false,
                    demat_number: '1208160012312312',
                    dp_name: 'ZERODHA BROKING LIMITED',
                    customer_email: 'rahul.chandra@incredmoney.com',
                    customer_name: 'RAHUL CHANDRA NIRMALA',
                    product_code: 'keertana2',
                    product_name: 'Keertana Finserv Private Limited',
                    product_isin: 'INE0NES07030-2',
                    product_type: 'BOND',
                    product_issuer: 'Keertana Finserv Private Limited',
                    customer_id: '64eddd1a5c120a5406b3a43f',
                    advisor_id: '64cce8641ba21d7aedba7628',
                    account_id: '65574c5e3645875325161d11',
                    created_at: '2023-12-04T07:03:49.785Z',
                    updated_at: '2023-12-07T05:38:21.911Z',
                },
            },
        },
    ],
};

export default ordersResource;
