import { ApiResource } from 'src/constants/app.const';

const productsResource: ApiResource = {
    name: 'products',
    path: '/docs/resources/backend/products',
    description:
        'The product APIs facilitate interactions with product-related information. They include endpoints for retrieving a list of available productss, detailed information about a specific BOND,MLD and IPO',
    title: 'The Product model',
    subtitle:
        'This database model encompasses various details including identifiers such as ISIN and bondId, financial information like coupon rate and face value, issuance details such as issue date and price, as well as marketing and informational links. The model provides a comprehensive overview of the bond, its features, issuer information, and associated communications.',
    properties: [
        {
            name: 'isin',
            type: 'string',
            description: 'International Securities Identification Number of the bond.',
        },
        {
            name: 'bond_id',
            type: 'string',
            description: 'Identifier for the bond, specific to Keertana Finserv.',
        },
        {
            name: 'category',
            type: 'string',
            description: 'Category classification of the bond (e.g., "live").',
        },
        {
            name: 'coupon_rate',
            type: 'number',
            description: 'Coupon rate of the bond.',
        },
        {
            name: 'coupon_type',
            type: 'string',
            description: 'Type of coupon (e.g., "11.65% p.a (Monthly)").',
        },
        {
            name: 'description',
            type: 'string',
            description: 'Description of Keertana Finserv and its financial products.',
        },
        {
            name: 'face_value',
            type: 'number',
            description: 'Face value of the bond.',
        },
        {
            name: 'fund_id',
            type: 'string',
            description: 'Identifier for the fund associated with the bond.',
        },
        {
            name: 'is_active',
            type: 'boolean',
            description: 'Flag indicating whether the bond is active.',
        },
        {
            name: 'issue_category',
            type: 'string',
            description: 'Category classification of the bond issuance (e.g., "secured").',
        },
        {
            name: 'issue_date',
            type: 'string',
            description: 'Date of bond issuance (e.g., "06/23/2023").',
        },
        {
            name: 'issue_price',
            type: 'number',
            description: 'Issue price of the bond.',
        },
        {
            name: 'issue_size',
            type: 'number',
            description: 'Size of the bond issuance.',
        },
        {
            name: 'issue_type',
            type: 'string',
            description: 'Type of bond issuance (e.g., "public").',
        },
        {
            name: 'issuer',
            type: 'string',
            description: 'Issuer of the bond (e.g., "Keertana Finserv Private Limited").',
        },
        {
            name: 'listing',
            type: 'string',
            description: 'Listing frequency of the bond (e.g., "Monthly").',
        },
        {
            name: 'listing_type',
            type: 'string',
            description: 'Type of listing (e.g., "listed").',
        },
        {
            name: 'logo',
            type: 'string',
            description: 'URL for the logo associated with the bond.',
        },
        {
            name: 'maturity_date',
            type: 'string',
            description: 'Date when the bond matures (e.g., "02/22/2025").',
        },
        {
            name: 'max_amount',
            type: 'number',
            description: 'Maximum investment amount for the bond.',
        },
        {
            name: 'max_tenure',
            type: 'number',
            description: 'Maximum tenure of the bond.',
        },
        {
            name: 'minAmt',
            type: 'number',
            description: 'Minimum investment amount for the bond.',
        },
        {
            name: 'min_tenure',
            type: 'number',
            description: 'Minimum tenure of the bond.',
        },
        {
            name: 'principal_reorder',
            type: 'string',
            description: 'Reorder frequency of the principal (e.g., "Quarterly").',
        },
        {
            name: 'product',
            type: 'string',
            description: 'Identifier for the product (e.g., "keertana2").',
        },
        {
            name: 'name',
            type: 'string',
            description: 'Name of the product (e.g., "Keertana Finserv Private Limited").',
        },
        {
            name: 'rating',
            type: 'string',
            description: 'Credit rating of the bond (e.g., "CRISIL BBB").',
        },
        {
            name: 'tax_saving',
            type: 'string',
            description: 'Indicates whether the bond offers tax savings (e.g., "no").',
        },
        {
            name: 'why_invest',
            type: 'string',
            description: 'Detailed information on reasons to invest in the bond.',
        },
        {
            name: 'xirr',
            type: 'string',
            description: 'Internal Rate of Return (XIRR) for the bond (e.g., "11.75").',
        },
        {
            name: 'xirr_price_for_user',
            type: 'boolean',
            description: 'Boolean flag indicating whether XIRR price is displayed for the user.',
        },
        {
            name: 'type',
            type: 'string',
            description: 'Type of financial product (e.g., "bonds").',
        },
        {
            name: 'aum',
            type: 'string',
            description: 'Assets Under Management (AUM) for the bond.',
        },
        {
            name: 'debt_equity_ratio',
            type: 'string',
            description: 'Debt Equity Ratio for the bond.',
        },
        {
            name: 'gnpa',
            type: 'string',
            description: 'Gross Non-Performing Assets (GNPA) percentage for the bond.',
        },
        {
            name: 'market_Cap',
            type: 'string',
            description: 'Market capitalization for the bond.',
        },
        {
            name: 'net_worth',
            type: 'string',
            description: 'Net worth for the bond.',
        },
        {
            name: 'profit_after_tax',
            type: 'string',
            description: 'Profit after tax for the bond.',
        },
        {
            name: 'security_cover',
            type: 'string',
            description: 'Security cover for the bond.',
        },
        {
            name: 'order',
            type: 'number',
            description: 'Order or priority of the bond.',
        },
        {
            name: 'close_date',
            type: 'string',
            description: 'Closing date and time for the bond offering.',
        },
        {
            name: 'market_end_time',
            type: 'string',
            description: 'Market end time for the bond offering.',
        },
        {
            name: 'market_start_time',
            type: 'string',
            description: 'Market start time for the bond offering.',
        },
        {
            name: 'open_date',
            type: 'string',
            description: 'Opening date and time for the bond offering.',
        },
        {
            name: 'min_units',
            type: 'number',
            description: 'Minimum units allowed for the bond.',
        },
        {
            name: 'step_size',
            type: 'number',
            description: 'Step size or increment for units when transacting.',
        },
        {
            name: 'show_on_browse',
            type: 'boolean',
            description: 'Flag indicating whether the bond is shown in browse listings.',
        },
        {
            name: 'is_txn_allowed',
            type: 'boolean',
            description: 'Flag indicating whether transactions are allowed for the bond.',
        },
        {
            name: 'max_returns',
            type: 'number',
            description: 'Maximum returns for the bond.',
        },
        {
            name: 'min_returns',
            type: 'number',
            description: 'Minimum returns for the bond.',
        },
        {
            name: 'multiplier',
            type: 'number',
            description: 'Multiplier value for the bond.',
        },
        {
            name: 'true_isin',
            type: 'string',
            description:
                'The true ISIN (International Securities Identification Number) of the bond.',
        },
        {
            name: 'display_name',
            type: 'string',
            description: 'Display name for the bond (e.g., "Keertana Finserv Feb’25 (Tranche 2)").',
        },
        {
            name: 'price_is_live',
            type: 'boolean',
            description: 'Boolean flag indicating whether the bond price is live.',
        },
        {
            name: 'exit_load_in_perc',
            type: 'number',
            description: 'Exit load percentage for the bond.',
        },
        {
            name: 'highlights',
            type: 'array',
            description: 'Array of highlights containing web and text properties.',
        },
    ],
    endpoints: [
        {
            method: 'GET',
            path: '/products',
            title: 'List all products',
            description:
                'This endpoint allows you to retrieve a paginated list of all your products. By default, a maximum of ten customers are shown per page.',
            optionalAttributes: [
                {
                    name: 'category',
                    type: 'string',
                    description: 'category to filter products includes [live,upcoming,historical].',
                },
            ],
            requiredAttributes: [],
            request: {
                curl: `curl \n
                --request GET '{base_url}/products' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    total_count: 20,
                    collection: [
                        {
                            isin: 'INE07HK07643',
                            aum: '3,531 Cr',
                            bond_id: 'kb0',
                            category: 'live',
                            close_date: '2025-05-29T18:30:00.000Z',
                            coupon_rate: 11.8,
                            coupon_type: '11.80% p.a (Annually)',
                            description:
                                'KrazyBee Services Private Limited is a Non-Deposit taking Non-Banking Financial Institution (NBFC) registered with RBI. The company offers unsecured personal loans to young professionals, with ticket size varying up to Rs 4 lakh with average tenure of around eight months. The company commenced operations in fiscal 2017 and is promoted by Mr Madhusudan Ekambaram, Mr Vivek Veda and Mr Karthikeyan Krishnaswamy, who have prior experience in product portfolio management, sales, technology and finance.',
                            display_name: 'KrazyBee May’25',
                            exit_load_in_perc: 2,
                            face_value: 100000,
                            fund_id: 'kb0',
                            gnpa: '2.19%',
                            highlights: [
                                {
                                    web: 'Listed',
                                    text: 'Listed',
                                },
                                {
                                    web: 'Senior Secured',
                                    text: 'Senior Secured',
                                },
                                {
                                    web: 'Anytime Liquidity',
                                    text: 'Anytime Liquidity',
                                },
                            ],
                            is_active: true,
                            issue_category: 'secured',
                            issue_date: '11/30/2023',
                            issue_price: 100000,
                            issue_size: 100000000,
                            issue_type: 'private',
                            issuer: 'KrazyBee Services Private Limited',
                            listing: 'Annually',
                            listing_type: 'listed',
                            logo: 'https://marketing.incredmoney.com/Assets/LogoWeb/KrazyBee/45x45.png',
                            market_end_time: '23:59',
                            market_start_time: '00:00',
                            maturity_date: '05/30/2025',
                            max_amount: 50000000,
                            max_returns: 0,
                            max_tenure: 18,
                            min_amount: 100000,
                            min_returns: 0,
                            min_tenure: 1,
                            multiplier: 0,
                            net_worth: '2,101 Cr',
                            open_date: '2023-11-29T18:30:00.000Z',
                            order: 1,
                            price_is_live: false,
                            principal_repayment: 'At Maturity',
                            product: 'kb0',
                            name: 'KrazyBee Services Private Limited',
                            type: 'bonds',
                            rating: 'CRISIL A-/Stable',
                            security_cover: '1.1x with Loan receivables',
                            tax_saving: 'no',
                            true_isin: 'INE07HK07643',
                            why_invest:
                                '<span class="text-secondary  font-weight-semi-bold">Strong Investors:</span> KrazyBee is backed by strong PE investors such as Premji Invest, Advent International, MUFG Bank, TPG NewQuest Capital, Motilal Oswal Private Equity, ICICI Bank amongst others.|<span class="text-secondary  font-weight-semi-bold">Healthy Capitalization:</span> The Capital Adequacy Ratio (CRAR) is 45.6% which is significantly higher than RBI minimum limit of 15%|<span class="text-secondary  font-weight-semi-bold">Strong Asset Quality:</span> The company has a low GNPA of 2.19% and NNPA of 0.77% as on 30th Sep’23.|<span class="text-secondary  font-weight-semi-bold">Scalable Business:</span> Led by a strong Tech platform, KrazyBee has a scalable business where loan origination happens completely digitally through its mobile application.|<span class="text-secondary  font-weight-semi-bold">Profitable:</span> \n The company has posted a Profit After Tax of Rs. 71 Cr in H1FY24|<span class="text-secondary  font-weight-semi-bold">Diversified Borrowing:</span> Well-diversified borrowing profile with lenders including Public/ Private Sector Banks like SBI, Federal Bank, Indusind Bank, etc., and NBFCs.',
                            xirr: '11',
                            min_units: 1,
                            step_size: 1,
                            xirr_price_for_user: true,
                            tds: 10,
                            base_xirr: '12',
                            max_xirr_deviation: '11',
                            min_xirr_deviation: '11',
                            nnpa: '100',
                            show_on_browse: true,
                            is_txn_allowed: true,
                            show_on_mobile: true,
                        },
                    ],
                },
            },
        },
        {
            method: 'GET',
            path: ':product/queue',
            title: 'Get product price',
            description: 'This endpoint allows you to retrieve a specific product price.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'category',
                    type: 'string',
                    description: 'category of the product',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/products/queue' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {},
            },
        },
        {
            method: 'GET',
            path: '/products/:id',
            title: 'Get a product by id',
            description: 'This endpoint allows you to Get product details by id.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'id',
                    type: 'string',
                    description: 'Id of product',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/products/:id' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    isin: 'INE07HK07643',
                    aum: '3,531 Cr',
                    bond_id: 'kb0',
                    category: 'live',
                    close_date: '2025-05-29T18:30:00.000Z',
                    coupon_rate: 11.8,
                    coupon_type: '11.80% p.a (Annually)',
                    description:
                        'KrazyBee Services Private Limited is a Non-Deposit taking Non-Banking Financial Institution (NBFC) registered with RBI. The company offers unsecured personal loans to young professionals, with ticket size varying up to Rs 4 lakh with average tenure of around eight months. The company commenced operations in fiscal 2017 and is promoted by Mr Madhusudan Ekambaram, Mr Vivek Veda and Mr Karthikeyan Krishnaswamy, who have prior experience in product portfolio management, sales, technology and finance.',
                    display_name: 'KrazyBee May’25',
                    exit_load_in_perc: 2,
                    face_value: 100000,
                    fund_id: 'kb0',
                    gnpa: '2.19%',
                    highlights: [
                        {
                            web: 'Listed',
                            text: 'Listed',
                        },
                        {
                            web: 'Senior Secured',
                            text: 'Senior Secured',
                        },
                        {
                            web: 'Anytime Liquidity',
                            text: 'Anytime Liquidity',
                        },
                    ],
                    is_active: true,
                    issue_category: 'secured',
                    issue_date: '11/30/2023',
                    issue_price: 100000,
                    issue_size: 100000000,
                    issue_type: 'private',
                    issuer: 'KrazyBee Services Private Limited',
                    listing: 'Annually',
                    listing_type: 'listed',
                    logo: 'https://marketing.incredmoney.com/Assets/LogoWeb/KrazyBee/45x45.png',
                    market_end_time: '23:59',
                    market_start_time: '00:00',
                    maturity_date: '05/30/2025',
                    max_amount: 50000000,
                    max_returns: 0,
                    max_tenure: 18,
                    min_amount: 100000,
                    min_returns: 0,
                    min_tenure: 1,
                    multiplier: 0,
                    net_worth: '2,101 Cr',
                    open_date: '2023-11-29T18:30:00.000Z',
                    order: 1,
                    price_is_live: false,
                    principal_repayment: 'At Maturity',
                    product: 'kb0',
                    name: 'KrazyBee Services Private Limited',
                    type: 'bonds',
                    rating: 'CRISIL A-/Stable',
                    security_cover: '1.1x with Loan receivables',
                    tax_saving: 'no',
                    true_isin: 'INE07HK07643',
                    why_invest:
                        '<span class="text-secondary  font-weight-semi-bold">Strong Investors:</span> KrazyBee is backed by strong PE investors such as Premji Invest, Advent International, MUFG Bank, TPG NewQuest Capital, Motilal Oswal Private Equity, ICICI Bank amongst others.|<span class="text-secondary  font-weight-semi-bold">Healthy Capitalization:</span> The Capital Adequacy Ratio (CRAR) is 45.6% which is significantly higher than RBI minimum limit of 15%|<span class="text-secondary  font-weight-semi-bold">Strong Asset Quality:</span> The company has a low GNPA of 2.19% and NNPA of 0.77% as on 30th Sep’23.|<span class="text-secondary  font-weight-semi-bold">Scalable Business:</span> Led by a strong Tech platform, KrazyBee has a scalable business where loan origination happens completely digitally through its mobile application.|<span class="text-secondary  font-weight-semi-bold">Profitable:</span> \n The company has posted a Profit After Tax of Rs. 71 Cr in H1FY24|<span class="text-secondary  font-weight-semi-bold">Diversified Borrowing:</span> Well-diversified borrowing profile with lenders including Public/ Private Sector Banks like SBI, Federal Bank, Indusind Bank, etc., and NBFCs.',
                    xirr: '11',
                    min_units: 1,
                    step_size: 1,
                    xirr_price_for_user: true,
                    tds: 10,
                    base_xirr: '12',
                    max_xirr_deviation: '11',
                    min_xirr_deviation: '11',
                    nnpa: '100',
                    show_on_browse: true,
                    is_txn_allowed: true,
                    show_on_mobile: true,
                },
            },
        },
        {
            method: 'GET',
            path: ':product/:product_code/price',
            title: 'Get product price',
            description: 'This endpoint allows you to retrieve a specific product price.',
            optionalAttributes: [],
            requiredAttributes: [
                {
                    name: 'product_code',
                    type: 'string',
                    description: 'The product_code of product',
                },
                {
                    name: 'units',
                    type: 'number',
                    description: ' Total units',
                },
                {
                    name: 'return_rate',
                    type: 'number',
                    description: 'The return rate of product',
                },
            ],
            request: {
                curl: `curl \n
                --request GET '{base_url}/products/:product_code/price' \n
                --header 'Authorization: Bearer {api_token}'`,
            },
            response: {
                success: true,
                data: {
                    user_amount: '305618.04890625',
                    price: '101872.68296875',
                    maturity_amount: ' 350583.16020000004',
                },
            },
        },
    ],
};

export default productsResource;
