import { ApiResource } from 'src/constants/app.const';

const paymentsResource: ApiResource = {
    name: 'payments',
    path: '/docs/resources/backend/payments',
    description:
        'Payments APIs represent a set of endpoints that facilitate the management and tracking of payments transactions within the system. These APIs enable functionalities related to the initiation, processing, and retrieval of information about orders made by users for payments',
    title: 'The Payments model',
    subtitle:
        'The Payments model represents a financial transaction related to the purchase of a financial product. It includes details about the order, customer, payments, and additional metadata.',
    properties: [
        {
            name: 'id',
            type: 'string',
            description: 'Unique identifier for the payments.',
        },
        {
            name: 'group_order_id',
            type: 'string',
            description: 'TGroup order by their id.',
        },
        {
            name: 'customer_email',
            type: 'string',
            description: 'Email of the customer.',
        },
        {
            name: 'customer_name',
            type: 'number',
            description: 'Name of the customer.',
        },
        {
            name: 'customer_upi',
            type: 'number',
            description: 'UPI of customer.',
        },
        {
            name: 'ops_remark',
            type: 'string',
            description: 'Remark for the status.',
        },
        {
            name: 'ops_status',
            type: 'string',
            description: 'Ops status for the payment.',
        },
        {
            name: 'status',
            type: 'string',
            description: 'Payment status of payments.',
        },
        {
            name: 'date',
            type: 'string',
            description: 'Date of the payment.',
        },
        {
            name: 'demat_number',
            type: 'string',
            description: 'Demat number of the customer.',
        },
        {
            name: 'dp_name',
            type: 'string',
            description: 'Depository participant name associated with the order.',
        },
        {
            name: 'payment_mode',
            type: 'string',
            description: 'Payment mode used.',
        },
        {
            name: 'product_code',
            type: 'string',
            description: 'Code associated with the product.',
        },
        {
            name: 'product_name',
            type: 'string',
            description: 'Name of the product.',
        },
        {
            name: 'product_isin',
            type: 'string',
            description: 'ISIN (International Securities Identification Number) of the product.',
        },
        {
            name: 'product_type',
            type: 'string',
            description: 'Type/category of the product.',
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
            path: '/payments',
            title: 'Get advisor payments.',
            description: 'This endpoint allows you to Get advisor payments..',
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
                {
                    name: 'customer_id',
                    type: 'ObjectId',
                    description: 'Customer id of the customer.',
                },
                {
                    name: 'account_id',
                    type: 'ObjectId',
                    description: 'Account id of the customer.',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    total_count: 20,
                    page: 1,
                    per_page: 10,
                    collection: [
                        {
                            customer_name: 'MOULESH DILIP CHAVAN',
                            status: 'PAYMENT_LINK_OPENED',
                            product_code: 'ac0',
                            product_name: 'Akara Capital Advisors Private Limited',
                            product_type: 'BOND',
                            type: 'purchase',
                            units: 1,
                            user_amount: 82890.4915738721,
                            customer_id: '65814858abb7a2a0e265cfe4',
                            id: '658d6ee2429b4f69ed1d79a0',
                            transaction_date: '2023-12-28T12:49:53.684Z',
                        },
                    ],
                },
            },
        },
        {
            method: 'GET',
            path: '/payments/hours',
            title: 'Returns all customer payments based on time',
            description:
                'This endpoint allows you to create a order and responds with a order link to make the transaction.',
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
                {
                    name: 'customer_id',
                    type: 'ObjectId',
                    description: 'Customer id of the customer.',
                },
                {
                    name: 'account_id',
                    type: 'ObjectId',
                    description: 'Account id of the customer.',
                },
            ],
            requiredAttributes: [
                {
                    name: 'hours',
                    type: 'number',
                    description: 'Get the customer according hours.',
                },
            ],
            request: {
                curl: `curl \n
                --request POST '{base_url}/payments/hours' \n
                --header 'Authorization: Bearer {api_token}' \n
                --data 'hours=""' \n`,
            },
            response: {
                success: true,
                data: [
                    {
                        customer_email: 'gopal.raut+6366127@incredmoney.com',
                        customer_name: 'Gopal12',
                        ops_remark: 'Payment link sent',
                        ops_status: 'pending',
                        status: 'PAYMENT_LINK_SENT',
                        demat_number: '1208160042551231',
                        product_code: 'ac0',
                        product_name: 'Akara Capital Advisors Private Limited',
                        product_isin: 'INE08XP07159',
                        product_type: 'BOND',
                        product_issuer: 'Akara Capital Advisors Private Limited',
                        type: 'purchase',
                        message: '',
                        unit_price: 83045.0698429321,
                        units: 1,
                        return_rate: 12,
                        user_amount: 83045.0698429321,
                        is_consent_given: false,
                        customer_id: '656d7414b5fd64f31754eb4e',
                        advisor_id: '65697a58882d4812ef0e7ebd',
                        account_id: '65697a58882d4812ef0e7ebb',
                        created_at: '2024-01-03T10:08:22.534Z',
                        updated_at: '2024-01-03T10:08:22.534Z',
                        account: {
                            code: 'ICMP002',
                            id: '65697a58882d4812ef0e7ebb',
                        },
                        advisor: {
                            name: 'DHRUMILKUMAR HIMMATLAL PANCHAL',
                            id: '65697a58882d4812ef0e7ebd',
                        },
                        id: '6595321668eaa00083165aa1',
                    },
                ],
            },
        },
        {
            method: 'POST',
            path: '/payments',
            title: 'Create payments',
            description:
                'This endpoint allows you to create payments and sends transaction link to customers.',
            optionalAttributes: [
                {
                    name: 'message',
                    type: 'string',
                    description: 'Message for the payments.',
                },
                {
                    name: 'customer_ids',
                    type: 'string',
                    description: 'customer_ids for the customer.',
                },
            ],
            requiredAttributes: [
                {
                    name: 'product_code',
                    type: 'string',
                    description: 'Product code for the payment.',
                },
                {
                    name: 'product_name',
                    type: 'string',
                    description: 'Name of the Product.',
                },
                {
                    name: 'product_type',
                    type: 'string',
                    description: 'Type of the product.',
                },
                {
                    name: 'product_isin',
                    type: 'string',
                    description: 'Product isin.',
                },
                {
                    name: 'product_issuer',
                    type: 'string',
                    description: 'product issuer for the payment.',
                },
                {
                    name: 'units',
                    type: 'string',
                    description: 'Total no of  unit.',
                },
                {
                    name: 'return_rate',
                    type: 'string',
                    description: 'Return rate on prodcut.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'product_code=""' \n
                --form 'product_name=""' \n
                --form 'product_type=""' \n
                --form 'product_isin=""' \n
                --form 'product_issuer=""' \n
                --form 'units=""' \n
                --form 'return_rate=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Payment link sent successfully.',
            },
        },
        {
            method: 'POST',
            path: '/payments/ipo',
            title: 'Create IPO payments',
            description:
                'This endpoint allows you to create  IPO payments and sends transaction link to customers.',
            optionalAttributes: [
                {
                    name: 'product_series',
                    type: 'string',
                    description:
                        'Give the Product series with isin number,name,code,issuer,unit,unit_price,user_amount.',
                },
                {
                    name: 'customer_upi',
                    type: 'string',
                    description: 'Upi of the customer.',
                },
            ],
            requiredAttributes: [
                {
                    name: 'group_isin',
                    type: 'string',
                    description: 'Group isin number.',
                },
                {
                    name: 'group_isin',
                    type: 'string',
                    description: 'Customer id.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/ipo' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'product_series=""' \n
                --form 'customer_upi=""' \n
                --form 'group_isin=""' \n
                --form 'group_isin=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message:
                    'The application for IPO has been placed, please check your email for further instructions.',
            },
        },
        {
            method: 'PATCH',
            path: '/payments/payment_id',
            title: 'Update payments',
            description:
                'This endpoint allows you to create  IPO payments and sends transaction link to customers.',
            optionalAttributes: [
                {
                    name: 'product_series',
                    type: 'string',
                    description:
                        'Give the Product series with isin number,name,code,issuer,unit,unit_price,user_amount.',
                },
                {
                    name: 'customer_upi',
                    type: 'string',
                    description: 'Upi of the customer.',
                },
            ],
            requiredAttributes: [
                {
                    name: 'group_isin',
                    type: 'string',
                    description: 'Group isin number.',
                },
                {
                    name: 'group_isin',
                    type: 'string',
                    description: 'Customer id.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/payment_id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'product_series=""' \n
                --form 'customer_upi=""' \n
                --form 'group_isin=""' \n
                --form 'group_isin=""' \n`,
            },
            response: {
                success: true,
                data: {},
                message: '',
            },
        },
        {
            method: 'POST',
            path: '/payments/send-consent-otp',
            title: 'Sends payment consent otp',
            description: 'This endpoint allows you to Sends payment consent otp.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'customer_id',
                    type: 'string',
                    description: 'Group isin number.',
                },
                {
                    name: 'group_id',
                    type: 'string',
                    description: 'Group id of customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/send-consent-otp' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'group_id="65212a4d146af3e4fb943cb4"' \n
                --form 'Customer="64ed87b52c3f289e486d05f5"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'OTP sent successfully',
            },
        },
        {
            method: 'POST',
            path: '/payments/verify-consent-otp',
            title: 'Verify consent otp consent otp',
            description: 'This endpoint allows you to verify-consent-otp.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'group_id',
                    type: 'string',
                    description: 'Group id of customer.',
                },
                {
                    name: 'phone_otp',
                    type: 'string',
                    description: 'Phone OTP.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/verify-consent-otp' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'group_id="65212a4d146af3e4fb943cb4"' \n
                --form 'phone_otp="1234"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'OTP verified successfully',
            },
        },
        {
            method: 'GET',
            path: '/payments/ipo/:payment_id/sync',
            title: 'Syncs IPO payment',
            description: 'This endpoint allows you to Syncs IPO payment.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'payment_id',
                    type: 'string',
                    description: 'Payment id of customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/ipo/:payment_id/sync' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'payment_id="65212a4d146af3e4fb943cb4"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'IPO application status is successfully synced',
            },
        },
        {
            method: 'POST',
            path: '/payments/ipo/:payment_id/cancle',
            title: 'Cancle IPO payment',
            description: 'This endpoint allows you to cancle IPO payment.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'payment_id',
                    type: 'string',
                    description: 'Payment id of customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/ipo/:payment_id/cancle' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'payment_id="65212a4d146af3e4fb943cb4"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'IPO application has been cancelled.',
            },
        },
        {
            method: 'GET',
            path: '/payments/ipo/:group_id',
            title: 'returns IPO payment',
            description: 'This endpoint allows you to return IPO payment.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'group_id',
                    type: 'string',
                    description: 'group id of payment.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/ipo/:group_id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'group_id="6524c534c8667ca50dd8ab19"' \n`,
            },
            response: {
                success: true,
                data: {
                    customer: {
                        name: 'SHARVAN KUMAR',
                        phone_number: '8600800144',
                        demat_number: '1208160042551231',
                        upi_id: '7676@ybl',
                        id: '651fd81120d69378aff9bc9b',
                    },
                    payments: [
                        {
                            ops_remark: 'Payment link sent',
                            ops_status: 'pending',
                            customer_email: 'reach.rahulcn+221@gmail.com',
                            customer_name: 'SHARVAN KUMAR',
                            customer_upi: '7676811@ybl',
                            admin_remark: 'Payment link sent',
                            admin_status: 'pending',
                            status: 'Order Cancelled',
                            demat_number: '1208160042551231',
                            product_code: 'icfin0-s1',
                            product_name: 'InCred Finance March 25 - Series I',
                            product_isin: 'ICFINIPONES07030-S1',
                            product_type: 'IPO',
                            product_issuer: 'InCred Finance Limited',
                            type: 'purchase',
                            unit_price: 1000,
                            units: 12,
                            user_amount: 12000,
                            is_consent_given: true,
                            group_isin: 'MMFSLNCD1',
                            group_id: '6524c534c8667ca50dd8ab19',
                            customer_id: '651fd81120d69378aff9bc9b',
                            advisor_id: '64cce8641ba21d7aedba7628',
                            created_at: '2023-10-10T03:29:56.428Z',
                            updated_at: '2024-01-04T07:24:23.749Z',
                            dp_name: null,
                            group_order_id: 'fe74d413-2a3e-4bee-ac98-fd725385789d',
                            metadata: {
                                orderId: '4385d75fdfcf3be9',
                                ISIN: 'ICFINIPONES07030-S1',
                                bondId: 'MMFSLNCD1',
                                trueISIN: 'MMFSLNCD1',
                                productName: '1',
                                accountNumber: '7676811@ybl',
                                amount: 12000,
                                amountBreakup: {
                                    isTxnAllowed: true,
                                    unitPrice: 1000,
                                    units: 12,
                                    amount: 12000,
                                    userAmount: 12000,
                                    oroAmount: 0,
                                    tradeDate: '10/10/2023',
                                    settlementDate: '10/10/2023',
                                },
                                amountDue: 0,
                                amountPaid: 12000,
                                createdAt: 1696908636.27,
                                currency: 'INR',
                                custId: 'OB1006230598',
                                custName: 'SHARVAN KUMAR',
                                demat: '1208160042551231',
                                dpName: null,
                                email: 'reach.rahulcn+221@gmail.com',
                                entity: 'order',
                                ifscCode: '',
                                pan: 'CKMPK0237K',
                                paymentType: 'upi',
                                product: 'icfin0-s1',
                                productType: 'ipo',
                                type: 'purchase',
                                subType: '',
                                timeStamp: '2023-10-10T03:30:36.270Z',
                                userId: '651fd8119bd8a03b7f90b8ab',
                                status: 'prebook',
                                orderType: 'prebook',
                                groupOrderId: 'fe74d413-2a3e-4bee-ac98-fd725385789d',
                                applicationType: 'online',
                            },
                            order_id: '4385d75fdfcf3be9',
                            ordered_at: '2023-10-10T03:30:36.270Z',
                            account_id: '65574c5e3645875325161d11',
                            document_id: 'paym_6566fdded4a56b54a1731b9c',
                            id: '6524c534c8667ca50dd8ab1a',
                        },
                    ],
                },
                message: '',
            },
        },
        {
            method: 'GET',
            path: '/payments/:id/link',
            title: 'Link IPO payment',
            description: 'This endpoint allows you to link IPO payment.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'id',
                    type: 'string',
                    description: 'id of customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/:id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'id="65212a4d146af3e4fb943cb4"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: '',
            },
        },
        {
            method: 'GET',
            path: '/payments/:id/sync',
            title: 'Sync payment from B2C',
            description: 'This endpoint allows you to Sync payment from B2C.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'id',
                    type: 'string',
                    description: 'id of customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/:id/sync' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'id="65212a4d146af3e4fb943cb4"' \n`,
            },
            response: {
                success: true,
                data: {},
                message: 'Payment synced successfully',
            },
        },
        {
            method: 'GET',
            path: '/payments/:id',
            title: 'Sync payment from B2C',
            description: 'This endpoint allows you to Sync payment from B2C.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'id',
                    type: 'string',
                    description: 'id of customer.',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/payments/:id' \n
                --header 'Authorization: Bearer {api_token}'
                --form 'id="6524c534c8667ca50dd8ab19"' \n`,
            },
            response: {
                success: true,
                data: {
                    payment: {
                        customer_email: 'rahul.chandra@incredmoney.com',
                        customer_name: 'RAHUL CHANDRA NIRMALA',
                        admin_remark: 'Payment link sent',
                        admin_status: 'pending',
                        status: 'Order Initiated',
                        demat_number: '1208160012312312',
                        product_code: 'indostar0',
                        product_name: 'IndoStar Capital Finance Limited',
                        product_isin: 'INE896L07850',
                        product_type: 'BOND',
                        issuer_name: 'IndoStar Capital Finance Limited',
                        type: 'purchase',
                        message: '',
                        unit_price: 100259.7296,
                        units: 1,
                        user_amount: 100335.2603,
                        customer_id: '64eddd1a5c120a5406b3a43f',
                        advisor_id: '64cce8641ba21d7aedba7628',
                        created_at: '2023-09-29T12:21:31.279Z',
                        updated_at: '2024-01-04T07:42:38.308Z',
                        account_id: '65574c5e3645875325161d11',
                        document_id: 'paym_6566fdddd4a56b54a1731b3f',
                        dp_name: 'ZERODHA BROKING LIMITED',
                        foreign_id: '658d71673a9a1a1a9f88456d',
                        is_consent_given: false,
                        metadata: {
                            _id: '658d71673a9a1a1a9f88456d',
                            orderId: 'order_NHm3l985QfXz19',
                            ISIN: 'INE896L07850',
                            accountNumber: '1234567890',
                            amount: 10014719,
                            amountBreakup: {
                                isTxnAllowed: true,
                                unitPrice: 100147.1919,
                                units: 1,
                                unitsUnderBenefit: 0,
                                unitsNotUnderBenefit: 1,
                                ytmWithBenefit: 0,
                                ytmWithoutBenefit: 10.31,
                                benefitUserAmount: 0,
                                withoutBenefitUserAmount: 100147.1919,
                                benefit: 0,
                                amount: 100147.19,
                                userAmount: 100147.1919,
                                oroAmount: 0,
                                ytm: 10.31,
                                tradeDate: '12/28/2023',
                                settlementDate: '12/29/2023',
                                accruedInterest: 163.11475409836044,
                            },
                            amountDue: 10014719,
                            amountPaid: 0,
                            attempts: 0,
                            createdAt: 1703768423,
                            currency: 'INR',
                            custId: 'OB0823230506',
                            custName: 'RAHUL CHANDRA NIRMALA',
                            demat: '1208160012312312',
                            dpName: 'ZERODHA BROKING LIMITED',
                            email: 'rahul.chandra@incredmoney.com',
                            entity: 'order',
                            ifscCode: 'ICIC0007281',
                            key_id: 'rzp_test_3r15pQsXO4J37q',
                            notes: ['InCredMoney'],
                            offerId: null,
                            pan: 'ATDPN8025C',
                            partner: 'icmAdvisory',
                            paymentType: null,
                            product: 'indostar0',
                            productType: 'BOND',
                            receipt: '2e312c2b-91c3-48e9-9976-9b7a6ecf29f3',
                            redirect: true,
                            rfqOrderDetails: null,
                            status: 'created',
                            subPartner: 'ICMP000',
                            subType: '',
                            timeStamp: '2023-12-28T13:00:23.558Z',
                            type: 'purchase',
                            url: 'https://uatapi.incredmoney.com/orobonds/pg/callback/indostar0',
                            userId: '64acdd2691fc0cd7adcb9f60',
                        },
                        ops_remark: 'Payment link sent',
                        ops_status: 'pending',
                        order_id: 'order_NHm3l985QfXz19',
                        ordered_at: '2023-12-28T13:00:23.000Z',
                        customer: {
                            name: 'RAHUL CHANDRA NIRMALA',
                            demat_number: '1208160012312312',
                            id: '64eddd1a5c120a5406b3a43f',
                        },
                        advisor: {
                            name: 'Rahul',
                            id: '64cce8641ba21d7aedba7628',
                        },
                        id: '6516c14b424784e49e9b06b2',
                    },
                    investment: {
                        isTxnAllowed: true,
                        unitPrice: 100335.2603,
                        units: 1,
                        unitsUnderBenefit: 0,
                        unitsNotUnderBenefit: 1,
                        ytmWithBenefit: 0,
                        ytmWithoutBenefit: 10.31,
                        benefitUserAmount: 0,
                        withoutBenefitUserAmount: 100335.2603,
                        benefit: 0,
                        amount: 100335.26,
                        userAmount: 100335.2603,
                        oroAmount: 0,
                        ytm: 10.31,
                        tradeDate: '01/04/2024',
                        settlementDate: '01/05/2024',
                        referralBenefits: {},
                        accruedInterest: 353.41530054644755,
                    },
                },
                message: 'Payment synced successfully',
            },
        },
    ],
};

export default paymentsResource;
