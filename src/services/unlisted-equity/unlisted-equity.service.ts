import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateOrderDmo, CreateOrderResp } from './dto/create-order.dmo';
import { ResData, ResProps1 } from 'types';
import { CustomerDocument, ConnectionType } from 'src/models';
import { Gender } from 'src/constants/customer.const';
import * as pickBy from 'lodash/pickBy';
import * as identity from 'lodash/identity';
import { GetTransactionsDmo, GetTransactionsResp } from './dto/get-transactions.dmo';
import { GetPriceDmo, GetPriceResp } from './dto/get-price.dmo';

interface UnlistedEquityRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export default class UnlistedEquityService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    icmApiUrl = this.configService.get<string>('ICM_API_URL');
    icmPartnerId = this.configService.get<string>('ICM_PARTNER_ID');

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    async getAccessToken(params: {
        account_code: string;
        name: string;
        email: string;
        phone_number: string;
    }): Promise<UnlistedEquityRes> {
        try {
            const bondsUrl = new URL('/generateicmAdvjwt', this.icmApiUrl);
            bondsUrl.searchParams.set('name', params.name);
            bondsUrl.searchParams.set('email', params.email);
            bondsUrl.searchParams.set('phone', `${params.phone_number}`);
            bondsUrl.searchParams.set('cCode', encodeURI('+91'));
            bondsUrl.searchParams.set('phoneVerified', 'true');
            bondsUrl.searchParams.set('partner', 'icmAdvisory');
            bondsUrl.searchParams.set('subPartner', params.account_code);

            return await this.request({ url: bondsUrl.href });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ getAccessToken ~ error:', error);
        }
    }

    async createCustomer(params: {
        account_code: string;
        name: string;
        email: string;
        phone_number: string;
    }): Promise<ResProps1<any>> {
        try {
            const resGetAccessToken = await this.getAccessToken(params);
            if (resGetAccessToken.success) {
                // Creating customer account
                const resCreateCustomer = await this.request({ url: resGetAccessToken.data.url });
                console.log('🚀 ~ ListedBondService ~ resCreateCustomer:', resCreateCustomer);

                if (!resCreateCustomer.success) {
                    return {
                        success: false,
                        message: 'Could not create customer, please contact support.',
                        errors: [
                            {
                                code: 'CREATE_CUSTOMER_FAILED',
                                message: resCreateCustomer.message,
                            },
                        ],
                    };
                }

                const customerData = resCreateCustomer.data;

                return {
                    success: true,
                    data: {
                        foreign_id: customerData.user.userId,
                        access_token: customerData.token,
                        access_token_expires_at: new Date(customerData.tokenExpiry),
                        api_token: resGetAccessToken.data.jwt,
                        is_existing_customer: customerData.user.isExistingUser,
                    },
                };
            } else {
                return {
                    success: false,
                    message: 'Could not get access token, please contact support.',
                    errors: [
                        {
                            code: 'GET_ACCESS_TOKEN_FAILED',
                            message: resGetAccessToken.message,
                        },
                    ],
                };
            }
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ createCustomer ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, Could not create customer account.',
            );
        }
    }

    /**
     * Update the customer details in ICMB
     * @param customer
     * @returns
     */
    async updateCustomer(customer: CustomerDocument): Promise<UnlistedEquityRes> {
        const incomeCategoryMap = {
            LT_1_LAKH: '1',
            '1_5_LAKH': '2',
            '5_10_LAKH': '3',
            '10_25_LAKH': '4',
            GT_25_LAKH: '5',
        };

        try {
            const customerParams = {};
            customerParams['productName'] = 'oroBonds'; // TODO: Change this to dynamic.
            customerParams['name'] = customer.name;
            customerParams['pan'] = customer.pan_number;
            customerParams['gender'] = customer.gender == Gender.MALE ? 'M' : 'F';
            customerParams['income'] = incomeCategoryMap[customer.income];
            customerParams['dob'] = customer.birth_date;
            customerParams['demat'] = customer.demat_number;
            customerParams['accountNumber'] = customer.account_number;
            customerParams['ifscCode'] = customer.ifsc_code;
            customerParams['addressDocType'] = 'address';
            customerParams['addressDetails'] = {};
            customerParams['addressDetails']['address'] = customer.address;
            customerParams['addressDetails']['state'] = customer.state;
            customerParams['addressDetails']['districtOrCity'] = customer.city;
            customerParams['addressDetails']['pincode'] = customer.pincode;
            customerParams['addressDetails']['localityOrPostOffice'] = customer.locality;
            customerParams['addressDetails']['country'] = customer.country;

            // Removing falsey values
            const cleanedObject = pickBy(customerParams, identity);

            return await this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/users/thirdpartyData`,
                data: { ...cleanedObject },
                headers: {
                    token: customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ updateCustomer ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not update customer.',
            );
        }
    }

    async refreshToken(customer: CustomerDocument): Promise<UnlistedEquityRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/partners/icmAdvisory`,
                params: {
                    verify_token: customer.getConnectionValue(ConnectionType.ICM, 'refresh_token'),
                    pid: '40',
                    source: 'icmAdvisory',
                },
                headers: {
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ refreshToken ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not refresh access token.',
            );
        }
    }

    /**
     * Get unlisted product price
     * @param params
     * @returns
     */
    async getPrice({ isin, ...getPriceDmo }: GetPriceDmo): Promise<ResData<GetPriceResp>> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/unlisted/equities/isins/${isin}/prices`,
                params: { ...getPriceDmo },
                headers: { partnerId: this.icmPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ getPrice ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get product price.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async getPriceList(params: { product_code: string }): Promise<UnlistedEquityRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/unlisted/equities/${params.product_code}/prices/all`,
                headers: {
                    'x-product': `orobonds:${params.product_code}`,
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ getPriceList ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get product prices.',
            );
        }
    }

    /**
     * Creating purchase order from ICMB
     * @param payment
     * @param customer
     * @param access_token
     */
    async createOrder({
        accessToken,
        productIsin,
        productCode,
        accountCode,
        ...createOrderDmo
    }: CreateOrderDmo): Promise<ResData<CreateOrderResp>> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/unlisted/equities/isins/${productIsin}/transactions`,
                data: { ...createOrderDmo },
                headers: {
                    token: accessToken,
                    'x-product': `orobonds:${productCode}`,
                    'x-partner': `${this.icmPartnerId}:${accountCode}`,
                },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ createOrder ~ error:', error);
            const defaultMessage = 'Service unavailable, could not create purchase order.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Get all the Unlisted products
     * @returns { data: Product[] }
     */
    async getUnlistedEquities(): Promise<UnlistedEquityRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/unlisted/equities/isins`,
                headers: { partnerId: this.icmPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ getUnlistedEquities ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the products.',
            );
        }
    }

    /**
     * Get product by ISIN
     * @param isin string
     * @returns { data: Product }
     */
    async getProduct(isin: string): Promise<UnlistedEquityRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/unlisted/equities/isins/${isin}`,
                headers: { partnerId: this.icmPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ getUnlistedProduct ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the product.',
            );
        }
    }

    /**
     * Get all the Unlisted products
     * @returns { data: Product[] }
     */
    async getCustomerUnlistedPortfolio(token: string): Promise<UnlistedEquityRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/unlisted/equities/portfolio`,
                headers: {
                    token: token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log(
                '🚀 ~ UnlistedEquityService ~ getCustomerUnlistedPortfolio ~ error:',
                error,
            );
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the products.',
            );
        }
    }

    /**
     * @param access_token
     * @returns
     */
    async getTransactions({
        accessToken,
        productCode,
        productIsin,
        orderId,
    }: GetTransactionsDmo): Promise<ResData<GetTransactionsResp>> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/unlisted/equities/isins/${productIsin}/transactions`,
                params: { orderId },
                headers: {
                    token: accessToken,
                    'x-product': `orobonds:${productCode}`,
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ getProductTxns ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get transaction timeline.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Generating customer id in ICMB with KYC status
     *  pending, which is required for IPO.
     * @param access_token
     */
    async generateCustId(access_token: string): Promise<UnlistedEquityRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/orobonds/users/processUser`,
                headers: {
                    token: access_token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ generateCustId ~ error:', error);
            throw new ServiceUnavailableException('Could not generate customer ID.');
        }
    }
}
