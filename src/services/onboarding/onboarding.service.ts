import { ResData, ResProps1, ResResults } from 'types';
import * as pickBy from 'lodash/pickBy';
import * as identity from 'lodash/identity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CustomerKycStatus, Gender } from 'src/constants/customer.const';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Customer, CustomerDocument, ConnectionType, Connection } from 'src/models/customer.model';
import { GetAccessTokenResp } from './dmo/get-access-token.dto';
import { GetCustomerStatusResp } from './dmo/get-customer-status.dto';
import { GetPanDetailsDto, GetPanDetailsResp } from './dmo/get-pan-details.dto';
import { CreateCustomerDmo, CreateCustomerResp } from './dmo/create-customer.dmo';
import { UpdateCustomerDmo } from './dmo/update-customer.dmo';
import { format } from 'date-fns';
import { CustomerCvlKycStatus, CvlKycDataResponse } from 'src/constants/onboarding.const';
import {
    CvlDataTransformToCustomer,
    CvlDataTransformToProfile,
} from 'src/app/backend/customers/dmo/cvl-data-transform.dmo';

interface BondsRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export default class OnboardingService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    icmApiUrl = this.configService.get<string>('ICM_API_URL');
    biddApiUrl = this.configService.get<string>('BIDD_API_URL');
    partnerId = this.configService.get<string>('ICM_PARTNER_ID');
    opsAdminAccessToken = this.configService.get<string>('OPS_ADMIN_ACCESS_TOKEN');

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    private getBaseUrl(connectionType: ConnectionType) {
        switch (connectionType) {
            case ConnectionType.BIDD:
                return this.biddApiUrl;
            default:
                return this.icmApiUrl;
        }
    }

    private async initCustomer(params: {
        connection_type: ConnectionType;
        account_code: string;
        name: string;
        email: string;
        phone_number: string;
    }): Promise<BondsRes> {
        try {
            const resGetBaseUrl = this.getBaseUrl(params.connection_type);
            const bondsUrl = new URL('/generateicmAdvjwt', resGetBaseUrl);
            bondsUrl.searchParams.set('name', params.name);
            bondsUrl.searchParams.set('email', params.email);
            bondsUrl.searchParams.set('phone', `${params.phone_number}`);
            bondsUrl.searchParams.set('cCode', encodeURI('+91'));
            bondsUrl.searchParams.set('phoneVerified', 'true');
            bondsUrl.searchParams.set('partner', 'icmAdvisory');
            bondsUrl.searchParams.set('subPartner', params.account_code);

            return await this.request({ url: bondsUrl.href });
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ initCustomer ~ error:', error);
        }
    }

    /**
     * Reloading the token from ICM
     * @param api_token
     * @param access_token
     * @param access_token_expires_at
     * @returns
     */
    async getAccessToken(
        connectionType: ConnectionType,
        refreshToken: string,
    ): Promise<ResData<GetAccessTokenResp>> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.getBaseUrl(connectionType)}/partners/icmAdvisory`,
                params: {
                    verify_token: refreshToken,
                    pid: '40',
                    source: 'icmAdvisory',
                },
                headers: {
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ getAccessToken ~ error:', error);
            const defaultMessage = 'Service unavailable, could not refresh access token.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async getPanDetails({
        accessToken,
        ...getPanDetailsDto
    }: GetPanDetailsDto): Promise<ResData<GetPanDetailsResp>> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/digioEsign/getUserNameFromPanV2`,
                data: { ...getPanDetailsDto },
                headers: {
                    token: accessToken,
                    partnerId: this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ getPanDetails ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get pan details.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async createReference(
        connection: Connection,
        params: {
            name: string;
            email: string;
            phone_number: string;
            account_code: string;
        },
    ): Promise<BondsRes & { jwt: string }> {
        try {
            const resGetAccessToken = await this.initCustomer({
                ...params,
                connection_type: connection.type,
            });

            if (!resGetAccessToken.success) {
                throw new Error(resGetAccessToken.message);
            }

            const tokenResponse = await this.request({ url: resGetAccessToken.data.url });

            // Creating reference code
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.getBaseUrl(connection.type)}/ref/getCode`,
                    headers: {
                        token: tokenResponse.data.token,
                        partnerId: this.partnerId,
                    },
                })
                .then(({ data }) => ({ ...resGetAccessToken.data, ...data }))
                .catch((e) => {
                    console.error(e);
                });
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ createReference ~ error:', error);
            throw new ServiceUnavailableException('Could not create reference code.');
        }
    }

    async createCustomer(
        createCustomerDmo: CreateCustomerDmo,
    ): Promise<ResData<CreateCustomerResp>> {
        try {
            const resInitCustomer = await this.initCustomer(createCustomerDmo);
            if (resInitCustomer.success) {
                // Creating customer account
                const resCreateCustomer = await this.request({ url: resInitCustomer.data.url });
                console.log('🚀 ~ OnboardingService ~ resCreateCustomer:', resCreateCustomer);

                if (!resCreateCustomer.success) {
                    return {
                        success: false,
                        error: 'CREATE_CUSTOMER_FAILED',
                        message: resCreateCustomer.message,
                    };
                }

                return {
                    success: true,
                    data: {
                        foreign_id: resCreateCustomer.data.user.userId,
                        access_token: resCreateCustomer.data.token,
                        access_token_expires_at: new Date(resCreateCustomer.data.tokenExpiry),
                        api_token: resInitCustomer.data.jwt,
                        is_existing_customer: resCreateCustomer.data.user.isExistingUser,
                    },
                };
            } else {
                return {
                    success: false,
                    error: 'INIT_CUSTOMER_FAILED',
                    message: resInitCustomer.message,
                };
            }
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ createCustomer ~ error:', error);
            const defaultMessage = 'Service unavailable, Could not create customer account.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async getCustomerStatus(
        connection: Connection,
        params: {
            email: string;
            pan_number: string;
        },
    ): Promise<ResData<GetCustomerStatusResp>> {
        try {
            const resData = await this.request({
                method: 'POST',
                url: `${this.getBaseUrl(connection.type)}/stats/checkpoints/status`,
                data: {
                    email: params.email,
                    pan: params.pan_number,
                    checkpoints: [
                        'obUserAdminResponseDone',
                        'obUserApproved',
                        'obUserNotInvested',
                        'obOrderAttempted',
                        'obDocSigned',
                        'obPaymentDone',
                        'obOrderApproved',
                        'obOrderRejected',
                    ],
                    path: 'obUserTxn',
                    productType: 'unlistedEquities',
                    skipCache: true,
                },
                headers: {
                    token: connection.access_token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });

            if (!resData.success) {
                return {
                    success: false,
                    message: resData.message,
                };
            }

            let KycStatus = CustomerKycStatus.KYC_SUBMITTED;

            if (resData.results.obUserAdminResponseDone) {
                KycStatus = resData.results.obUserApproved
                    ? CustomerKycStatus.KYC_VERIFIED
                    : CustomerKycStatus.KYC_REJECTED;
            }

            return {
                success: true,
                data: { status: KycStatus },
            };
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ getCustomerStatus ~ error:', error);
            const defaultMessage = 'Service unavailable, Could not get customer status.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async getKycId(connection: Connection): Promise<ResData<{ custId: string }>> {
        try {
            const resData = await this.request({
                method: 'GET',
                url: `${this.getBaseUrl(connection.type)}/orobonds/users/getPans`,
                headers: {
                    token: connection.access_token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });

            if (resData.data.length === 1) {
                return {
                    success: true,
                    data: {
                        custId: resData.data[0].custId,
                    },
                };
            }

            return {
                success: false,
                message: 'Kyc id not found.',
            };
        } catch (error) {
            console.log('🚀 ~ UnlistedEquityService ~ getCustomerId ~ error:', error);
            const defaultMessage = 'Service unavailable, Could not get customer ids.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async getCustomer(connection: Connection): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.getBaseUrl(connection.type)}/users/thirdpartyData`,
                headers: {
                    token: connection.access_token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ getCustomer ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get customer.');
        }
    }

    async checkCvlKycStatus(
        connection: Connection,
        pan: string,
    ): Promise<CustomerCvlKycStatus | null> {
        try {
            const response = await this.request({
                method: 'POST',
                url: `${this.getBaseUrl(connection.type)}/cvl/users/isKYCValid`,
                headers: {
                    token: connection.access_token,
                    'X-product': 'orobonds:default',
                    partnerId: this.partnerId,
                    'Content-Type': 'application/json',
                },
                data: {
                    pan,
                },
            });
            if (response?.success) {
                return response.data?.description?.text as CustomerCvlKycStatus;
            }
            return null;
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ getCustomer ~ error:', error.response.data);
            throw new ServiceUnavailableException('Service unavailable, could not get customer.');
        }
    }

    async getCustomerCvlData(connection: Connection, pan: string, birth_date: string) {
        const cvlKycStatus = await this.checkCvlKycStatus(connection, pan);
        if (cvlKycStatus === CustomerCvlKycStatus.KRA_VALIDATED) {
            try {
                const response = await this.request({
                    method: 'POST',
                    url: `${this.getBaseUrl(connection.type)}/cvl/users/getKraData`,
                    headers: {
                        token: connection.access_token,
                        'X-product': 'orobonds:default',
                        partnerId: this.partnerId,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        pan,
                        dob: format(new Date(birth_date), 'dd-MM-yyyy'),
                    },
                });
                if (response.success) {
                    const cvlData = response.data as CvlKycDataResponse;

                    const customerProfileUpdates = new CvlDataTransformToProfile(cvlData);
                    const customerUpdates = new CvlDataTransformToCustomer(cvlData);
                    return {
                        success: true,
                        data: {
                            customerProfileUpdates,
                            customerUpdates,
                        },
                    };
                } else {
                    return {
                        success: false,
                        data: {},
                        error: 'CVL KYC is not validated',
                    };
                }
            } catch (error) {
                console.log(
                    '🚀 ~ OnboardingService ~ getCustomerCvlData ~ error:',
                    error.response?.data || error.response || error,
                );
                return {
                    success: false,
                    data: {},
                    error: error.response?.data || error.response || error.message,
                };
            }
        } else {
            return {
                success: false,
                data: {},
                error: 'CVL KYC is not validated',
            };
        }
    }

    /**
     * Update the customer details in ICMB
     * @param customer
     * @returns
     */
    async updateCustomer({
        connectionType,
        accessToken,
        ...updateCustomerDmo
    }: UpdateCustomerDmo): Promise<BondsRes> {
        try {
            // Removing falsey values
            const customerParams = pickBy(updateCustomerDmo, identity);
            const addressDetails = pickBy(customerParams.addressDetails, identity);

            return this.request({
                method: 'POST',
                url: `${this.getBaseUrl(connectionType)}/users/thirdpartyData`,
                data: { ...customerParams, addressDetails },
                headers: {
                    token: accessToken,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ updateCustomer ~ error:', error);
            const defaultMessage = 'Service unavailable, could not update customer.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Generating customer id in ICMB with KYC status
     *  pending, which is required for IPO.
     * @param access_token
     */
    async generateCustId(connection: Connection): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.getBaseUrl(connection.type)}/orobonds/users/processUser`,
                    headers: {
                        token: connection.access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.partnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ generateCustId ~ error:', error);
            throw new ServiceUnavailableException('Could not generate customer ID.');
        }
    }

    /**
     * Checking if the customer is KYC verified.
     * ICMB cutomer id is required to make payment.
     * @param access_token
     * @returns
     */
    async getCustomerId(connection: Connection): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.getBaseUrl(connection.type)}/orobonds/users/getPans`,
                    headers: {
                        token: connection.access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.partnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ getCustomerId ~ error:', error);
            throw new ServiceUnavailableException('Could not get customer id.');
        }
    }

    /**
     * Approve or Reject Customer KYC
     */
    async acceptRejectKyc(
        connection: Connection,
        customer: Customer,
        params: {
            action: string;
            type?: string;
            remarks?: string;
        },
    ): Promise<BondsRes> {
        try {
            const customerParams = {};
            customerParams['pan'] = customer.pan_number;
            customerParams['email'] = customer.email;
            customerParams['name'] = customer.name;
            customerParams['productName'] = 'oroBonds';

            enum ActionMap {
                accept = 'docsAccepted',
                reject = 'docsRejected',
            }

            if (params.action === 'reject') {
                customerParams['type'] = params.type;
                customerParams['remarks'] = params.remarks;
            }

            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.getBaseUrl(connection.type)}/adminV2/orobonds/${
                        ActionMap[params.action]
                    }`,
                    data: { ...customerParams },
                    headers: {
                        token: this.opsAdminAccessToken,
                        'x-product': 'oroBonds:default',
                        'x-partner': this.partnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ OnboardingService ~ acceptRejectKyc ~ error:', error);
            throw new ServiceUnavailableException('Could not update KYC.');
        }
    }
}
