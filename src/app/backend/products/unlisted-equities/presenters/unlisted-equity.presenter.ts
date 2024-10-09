import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UnlistedEquityPresenter {
    @Expose({ name: 'isin' })
    ISIN: string;

    @Expose({ name: 'category' })
    category: string;

    @Expose({ name: 'max_amt' })
    maxAmt: number;

    @Expose({ name: 'max_price_deviation' })
    maxPriceDeviation: number;

    @Expose({ name: 'max_units' })
    maxUnits: number;

    @Expose({ name: 'debt_to_equity_ratio' })
    debtToEquityRatio: string;

    @Expose({ name: 'book_value' })
    bookValue: string;

    @Expose({ name: 'is_available' })
    isProductAvailable: boolean;

    @Expose({ name: 'min_price_deviation' })
    minPriceDeviation: number;

    @Expose({ name: 'min_units' })
    minUnits: number;

    @Expose({ name: 'price_step_size' })
    priceStepSize: number;

    @Expose({ name: 'product' })
    product: string;

    @Expose({ name: 'company' })
    company: any;

    @Expose({ name: 'digio' })
    digio: any;

    @Expose({ name: 'price' })
    price: any;

    @Expose({ name: 'strengths' })
    strengths: string[];

    @Expose({ name: 'weaknesses' })
    weaknesses: string[];

    @Expose({ name: 'distribution' })
    distribution: any;

    @Expose({ name: 'listing_type' })
    listingType: string;

    @Expose({ name: 'step_size' })
    stepSize: number;

    @Expose({ name: 'updated_at' })
    updatedAt: number;

    constructor(partial: Partial<UnlistedEquityPresenter>) {
        Object.assign(this, partial);
    }
}

/**
 * 
const testData = {
    ISIN: 'INE02KH01019',
    annualReports: {
        fiscalYears: ['Annual Report'],
        data: [
            {
                title: 'FY19',
                values: [
                    'https://drive.google.com/file/d/1DBW9kQekpoeeiiC1HpoA1gjjDtcY5nJn/view?usp=drive_link',
                ],
            },
            {
                title: 'FY20',
                values: [
                    'https://drive.google.com/file/d/1Wo0j-lls6q7qcF5w9lFDf4NXyTYWlmKh/view?usp=drive_link',
                ],
            },
            {
                title: 'FY21',
                values: [
                    'https://drive.google.com/file/d/1JRj1W3_96AGWHMcQt5azjSJimnTXq0ox/view?usp=drive_link',
                ],
            },
            {
                title: 'FY22',
                values: [
                    'https://drive.google.com/file/d/1ok98_w9jQsSPHBvsdyvlhahQRTIY_AyJ/view?usp=drive_link',
                ],
            },
        ],
    },
    boardOfDirectors: [
        {
            fullName: 'Sri. Pinarayi Vijayan',
            designation: 'Chairman ',
        },
        {
            fullName: 'Sri. S. Suhas IAS\t',
            designation: 'Managing Director ',
        },
        {
            fullName: 'Adv. P. Rajeeve\t',
            designation: 'Director ',
        },
        {
            fullName: 'Adv. K. Rajan\t',
            designation: 'Director ',
        },
        {
            fullName: 'Dr. V. P. Joy IAS\t',
            designation: 'Director',
        },
        {
            fullName: 'Sri. E. K. Bharat Bhushan\t',
            designation: 'Director ',
        },
        {
            fullName: 'Smt. Aruna Sundararajan\t',
            designation: 'Director ',
        },
        {
            fullName: 'Sri. Yusuffali M.A.\t',
            designation: 'Director ',
        },
        {
            fullName: 'Sri. N.V. George\t',
            designation: 'Director ',
        },
        {
            fullName: 'Sri. E.M. Babu\t',
            designation: 'Director ',
        },
        {
            fullName: 'Dr. P. Mohamad Ali\t',
            designation: 'Director',
        },
    ],
    bookValue: '₹55.29 ',
    category: 'historical',
    company: {
        description:
            '\nCochin International Airport (COK), owned by Cochin International Airport Limited (CIAL), was the first Public-Private Partnership (PPP) airport in the country, started on 25th May’99. ',
        overview:
            "Cochin International Airport (COK) also achieved global recognition as the world's first fully solar-powered airport. COK is the seventh largest airport in India and the third busiest in the world. The project's success is largely credited to its founder Chairman, Sri. K. Karunakaran, the former Chief Minister of Kerala. Notably, CIAL was the only Indian airport to turn a profit during the year following the pandemic.",
        sector: 'Aviation',
        logoUrl: 'https://assets.incredmoney.com/images/webp/CIAL.webp',
        whyInvest:
            'First PPP in India: The airport is one of its kind being the first Public-Private Partnership (PPP). It is also the country’s first airport that is entirely run on solar power. \nLong Track Record: The company has started commercial operations from June 1999 and has a strong operational track record of over two decades\n\nPremium Pricing Strategy: Cochin International Airport boasts a strong presence of leading domestic brands within its terminal. This premium pricing strategy, compared to competitors, has provided them with a significant financial advantage. This allows Cochin Airport to not only effectively counter competition but also invest in cutting-edge research and development.\n\nPost-Covid Recovery: CIAL has seen passenger traffic recover to 92% and 100% of the pre-Covid levels in FY2023 and H1 FY2024, respectively, and is likely to surpass the pre-Covid level in FY2024. \n',
        displayName: 'Cochin International Airport Limited',
        shareHoldingPattern: [
            {
                shareHolder: 'His Excellency, The Governor of Kerala\t',
                percentage: '32.4%',
            },
            {
                shareHolder: 'Mr. Yusuffali M. A.',
                percentage: '11.7%',
            },
            {
                shareHolder: 'Mr. N. V. George',
                percentage: '7%',
            },
            {
                shareHolder: 'M/s. Synthite Industries Private Limited',
                percentage: '3%',
            },
            {
                shareHolder: 'Others\t',
                percentage: '45.8%',
            },
        ],
        corporateActions: [
            {
                action: 'ssad',
            },
        ],
    },
    companyFinancials: {
        fiscalYears: ['FY19\t', 'FY20\t', 'FY21\t', 'FY22\t', 'FY23'],
        data: [
            {
                title: 'Share Capital\t',
                values: ['382.59\t', '382.60\t', '382.58\t', '382.58\t', '382.59'],
            },
            {
                title: 'Reserves and Surplus\t',
                values: ['1,024.44\t', '1,126.13\t', '932.00\t', '964.35\t', '1,732.96'],
            },
            {
                title: 'Total Equity\t',
                values: ['1,407.03\t', '1,508.73\t', '1,314.58\t', '1,346.93\t', '2,115.55'],
            },
            {
                title: 'Long Term Borrowings\t',
                values: ['553.8\t', '527.4\t', '562.4\t', '611.7\t', '560.2'],
            },
            {
                title: 'Other Long Term Liabilities\t',
                values: ['381.8\t', '353.7\t', '325.4\t', '319.3\t', '351.2'],
            },
            {
                title: 'Total Non-Current Liabilities\t',
                values: ['935.5\t', '881.1\t', '887.8\t', '931.0\t', '911.4'],
            },
            {
                title: 'Short Term Borrowings\t',
                values: ['2.4\t', '25.8\t', '100.3\t', '68.4\t', '113.8'],
            },
            {
                title: 'Other Current Liabilities\t',
                values: ['425.1\t', '420.6\t', '222.8\t', '166.2\t', '290.0'],
            },
            {
                title: 'Total Current Liabilities\t',
                values: ['427.4\t', '446.4\t', '323.1\t', '234.6\t', '403.8'],
            },
            {
                title: 'Equity + Liabilities\t',
                values: ['2,769.97\t', '2,836.18\t', '2,525.45\t', '2,512.51\t', '3,430.77'],
            },
            {
                title: 'Fixed Assets (incl. WIP)\t',
                values: ['2,184.60\t', '2,273.61\t', '2,281.30\tq', '2,222.20\t', '2,188.96'],
            },
            {
                title: 'Other Non Current Assets\t',
                values: ['80.20\t', '94.86\t', '32.75\t', '42.61\t', '80.68'],
            },
            {
                title: 'Total NC Assets\t',
                values: ['2,264.80\t', '2,368.47\t', '2,314.05', '\t2,264.81\t', '2,269.64'],
            },
            {
                title: 'Trade Receivables\t',
                values: ['77.5\t', '73.7\t', '55.0\t', '93.2\t', '100.6'],
            },
            {
                title: 'Cash and Bank Balances\t',
                values: ['304.6\t', '258.6\t', '93.0\t', '96.2\t', '767.6'],
            },
            {
                title: 'Other Current Assets\t',
                values: ['123.1\t', '135.4\t', '63.5\t', '58.3\t', '293.0'],
            },
            {
                title: 'Total Current Assets\t',
                values: ['505.2\t', '467.7\t', '211.4\t', '247.7\t', '1161.1'],
            },
            {
                title: 'Total Assets\t',
                values: ['2,769.97\t', '2,836.17\t', '2,525.47\t', '2,512.51\t', '3,430.78'],
            },
        ],
    },
    companyPresentations: {
        fiscalYears: [],
        data: [],
    },
    companyRatings: {
        fiscalYears: [],
        data: [],
    },
    debtToEquityRatio: '0.32',
    distribution: {
        faceValue: 10,
        profitAfterTax: '₹292.8 Cr',
        earningsPerShare: '₹7.59',
        shareCapital: '₹382.5 Cr',
        sales: '₹939.6 Cr',
        marketCap: '₹13,160.58 Cr',
        dividendYield: '0',
        priceToEarningsRatio: '45.32',
        priceToSalesRatio: '0',
        priceToBookRatio: '6.22',
        industryPE: '10.0',
    },
    isActive: true,
    listingType: 'listed',
    maxAmt: 10000000,
    maxPriceDeviation: 5,
    maxUnits: 100,
    minPriceDeviation: 5,
    minUnits: 5,
    priceStepSize: 0.05,
    product: 'CIAL',
    productType: 'unlistedEquities',
    profitAndLossTable: {
        fiscalYears: ['FY19\t', 'FY20\t', 'FY21\t', 'FY22\t', 'FY23'],
        data: [
            {
                title: 'Net Revenue\t',
                values: ['748.2\t', '781.3\t', '267.6\t', '502.3\t', '939.6'],
            },
            {
                title: 'Growth %\t',
                values: ['0', '4.42%', '-65.75%\t', '87.71%\t', '87.07%'],
            },
            {
                title: 'Total Operating Expenses\t',
                values: ['372.8\t', '345.7\t', '222.5\t', '275.4\t', '376.6'],
            },
            {
                title: 'Operating Profit (EBITDA)\t',
                values: ['375.4\t', '435.6\t', '45.1\t', '227.0\t', '563.0'],
            },
            {
                title: 'Operating Profit Margin %\t',
                values: ['50.17%\t', '55.75%\t', '16.85%\t', '45.18%', '59.92%'],
            },
            {
                title: 'Other Income\t',
                values: ['59.1\t', '28.8\t', '29.1\t', '21.9\t', '15.2'],
            },
            {
                title: 'Finance Costs\t',
                values: ['46.7\t', '54.3\t', '56.1\t', '54.9\t', '44.8'],
            },
            {
                title: 'Depreciation and Amortization Expense\t',
                values: ['116.8\t', '135.6\t', '141.1\t', '145.4\t', '141.7'],
            },
            {
                title: 'Profit beofore Tax\t',
                values: ['271.0\t', '274.5\t', '-123.0\t', '48.6\t', '391.7'],
            },
            {
                title: 'Income Tax\t',
                values: ['82.5\t', '37.0\t', '-30.2\t', '13.6\t', '98.9'],
            },
            {
                title: 'Tax %\t',
                values: ['30.44%\t', '13.48%\t', '24.51%\t', '27.95%\t', '25.26%'],
            },
            {
                title: 'Profit After Tax\t',
                values: ['188.5\t', '237.5\t', '-92.9\t', '35.0\t', '292.8'],
            },
            {
                title: 'Growth %\t\t',
                values: ['0', '25.99%\t', '-139.10%', '62.33%', '736.91%'],
            },
            {
                title: 'PAT %\t',
                values: ['25.19%\t', '30.40%\t', '-34.71%\t', '6.96%\t', '31.16%'],
            },
            {
                title: 'EPS\t',
                values: ['4.83\t', '5.91\t', '-2.37\t', '0.83\t', '7.59'],
            },
        ],
    },
    researchReport:
        'https://docs.google.com/document/d/1_dc_rIABJWfOIidSMx_4IXCNlQzriKtlC9XeMphtC1c/edit',
    seniorManagement: [
        {
            fullName: 'S. Suhas IAS',
            designation: 'Managing Director',
        },
        {
            fullName: 'Shri. Saji. K. George',
            designation: 'Executive Director & Company Secretary',
        },
        {
            fullName: 'Shri. Saji Daniel',
            designation: 'Chief Financial Officer',
        },
    ],
    showOnBrowse: true,
    showOnMobile: true,
    stepSize: 1,
    txnAllowed: true,
    updatedAt: 1722347469274,
    order: 1,
    strengths: [
        'First PPP in India: The airport is one of its kind being the first Public-Private Partnership (PPP). It is also the country’s first airport that is entirely run on solar power. ',
        'Long Track Record: The company has started commercial operations from June 1999 and has a strong operational track record of over two decades',
        'Premium Pricing Strategy: Cochin International Airport boasts a strong presence of leading domestic brands within its terminal. This premium pricing strategy, compared to competitors, has provided them with a significant financial advantage. This allows Cochin Airport to not only effectively counter competition but also invest in cutting-edge research and development.',
        'Post-Covid Recovery: CIAL has seen passenger traffic recover to 92% and 100% of the pre-Covid levels in FY2023 and H1 FY2024, respectively, and is likely to surpass the pre-Covid level in FY2024. ',
    ],
    weaknesses: [
        'Competition from International Airports: – CIAL has four international airports situated within 300 km radius from CIAL, viz. Trivandrum International Airport, Calicut International Airport, Coimbatore International Airport and Kannur International Airport',
        'Increase in CAPEX: The estimated capital expenditure over the next three years (FY24-FY26) is around ₹1,500 – ₹1,600 Cr, which is proposed to be funded through a mix of freshly raised equity of around Rs. 478.2 crore, internal accruals and debt.',
    ],
    shareOutstanding: 382575000,
    price: {
        ISIN: 'INE02KH01019',
        tradeDate: '08/01/2024',
        issueDate: '08/01/2024',
        maturityDate: '08/01/2024',
        price: 344,
        settlementDate: '08/01/2024',
        updatedAt: 1722402084029,
    },
};
 */
