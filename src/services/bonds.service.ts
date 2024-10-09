import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { Customer, CustomerDocument, ConnectionType } from 'src/models/customer.model';
import * as fs from 'fs';
import * as qs from 'qs';
import * as FormData from 'form-data';
import { Payment } from 'src/models/payment.model';
import { xml2js } from 'xml-js';
import { ThirdPartyCustomerDto } from 'src/app/backend/customers/dto/third-party-customer.dto';
import { B2CCustomerAttachmentMap, Gender } from 'src/constants/customer.const';
import { B2CAttachmentTypeMap } from 'src/constants/attachment.const';
import { Lead } from 'src/models/lead.model';
import * as pickBy from 'lodash/pickBy';
import * as identity from 'lodash/identity';
import { ResProps1 } from 'types';
import { ObjectId } from 'mongoose';
import { Attachment } from 'src/models/attachment.model';
import { ValidatePanDto } from 'src/app/backend/customers/dto/validate-pan.dto';
import { format } from 'date-fns';
import { Readable } from 'stream';

interface BondsRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export default class BondsService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    icmApiUrl = this.configService.get<string>('ICM_API_URL');
    biddApiUrl = this.configService.get<string>('BIDD_API_URL');
    icmPartnerId = this.configService.get<string>('ICM_PARTNER_ID');
    opsAdminAccessToken = this.configService.get<string>('OPS_ADMIN_ACCESS_TOKEN');

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    async getAccessToken(params: {
        account_code: string;
        name: string;
        email: string;
        phone_number: string;
    }): Promise<BondsRes> {
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
            return this.httpService.axiosRef.get(bondsUrl.href).then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getAccessToken ~ error:', error);
        }
    }

    async createReference(params: {
        name: string;
        email: string;
        phone_number: string;
        account_code: string;
    }): Promise<BondsRes & { jwt: string }> {
        try {
            const resGetAccessToken = await this.getAccessToken(params);

            if (!resGetAccessToken.success) {
                throw new Error(resGetAccessToken.message);
            }

            const tokenResponse = await this.request({ url: resGetAccessToken.data.url });

            // Creating reference code
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.icmApiUrl}/ref/getCode`,
                    headers: {
                        // jwtToken: resGetAccessToken.data.jwt,
                        token: tokenResponse.data.token,
                        partnerId: this.icmPartnerId,
                    },
                })
                .then(({ data }) => ({ ...resGetAccessToken.data, ...data }))
                .catch((e) => {
                    console.error(e);
                });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ createReference ~ error:', error);
            throw new ServiceUnavailableException('Could not create reference code.');
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
                console.log('🚀 ~ BondsService ~ resCreateCustomer:', resCreateCustomer);

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

                // if (data?.user.isExistingUser) {
                //     return {
                //         success: false,
                //         message: 'Customer already exists.',
                //     };
                // }

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
            console.log('🚀 ~ BondsService ~ createCustomer ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, Could not create customer account.',
            );
        }
    }

    async getAccessTokenFromRefreshToken(refreshToken: string) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/partners/icmAdvisory`,
                params: {
                    verify_token: refreshToken,
                    pid: '40',
                    source: 'icmAdvisory',
                },
                headers: {
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ refreshToken ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not refresh access token.',
            );
        }
    }

    /**
     * Reloading the token from ICM
     * @param api_token
     * @param access_token
     * @param access_token_expires_at
     * @returns
     */
    async refreshToken(customer: CustomerDocument): Promise<BondsRes> {
        // if (new Date(access_token_expires_at) > new Date()) {
        //     return {
        //         success: true,
        //         data: {
        //             token: access_token,
        //             tokenExpiry: access_token_expires_at,
        //         },
        //     };
        // } else {
        // }
        // const request = this.httpService
        //     .get(`${this.icmApiUrl}/partners/icmAdvisory`, {
        //         params: {
        //             verify_token: api_token,
        //             pid: '40',
        //             source: 'icmAdvisory',
        //         },
        //     })
        //     .pipe(map((res) => res.data));
        // return firstValueFrom(request);
        const api_token = customer.getConnectionValue(ConnectionType.ICM, 'refresh_token');
        return this.getAccessTokenFromRefreshToken(api_token);
    }

    async getCustomerStatus(token: string): Promise<AxiosResponse> {
        // const customerUrl = new URL('/stats/checkpoints/status', this.icmApiUrl);
        // customerUrl.searchParams.set('token', token);
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/stats/checkpoints/status`,
                    data: { checkpoints: [], path: 'thirdPartyOnboarding' },
                    headers: {
                        token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getCustomerStatus ~ error:', error);
            throw new ServiceUnavailableException('Could not get customer status.');
        }
    }

    async getCustomer(access_token: string): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/users/thirdpartyData`,
                headers: {
                    token: access_token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getCustomer ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get customer.');
        }
    }

    /**
     * Update the customer details in ICMB
     * @param customer
     * @returns
     */
    async updateCustomer(customer: Customer): Promise<BondsRes> {
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
            console.log('🚀 ~ BondsService ~ updateCustomer ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not update customer.',
            );
        }
    }

    async updateThirdPartyData(
        access_token: string,
        params: ThirdPartyCustomerDto,
    ): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/users/thirdpartyData`,
                    data: { ...params },
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ updateThirdPartyData ~ error:', error);
            throw new ServiceUnavailableException('Could not update third party data.');
        }
    }

    /**
     * Uploads the customer docs to B2C
     * @param fileStream
     * @param customer
     * @param attachment
     * @returns
     */
    async uploadCustomerDocs(
        fileStream: Readable,
        customer: Customer,
        attachment: Partial<Attachment & { link: string }>,
    ): Promise<AxiosResponse> {
        const docParams = {};
        docParams['email'] = customer.email;
        docParams['pan'] = customer.pan_number;
        docParams['type'] = B2CCustomerAttachmentMap[attachment.type];
        docParams['token'] = customer.getConnectionValue(ConnectionType.ICM, 'access_token');

        const form = new FormData();
        let response: AxiosResponse;
        try {
            const fileExtension = attachment.location.split('.').at(-1);
            const fileName = B2CCustomerAttachmentMap[attachment.type];
            form.append('file', fileStream, {
                filename: fileName + '.' + fileExtension,
            });

            console.log(`upload docs request`, docParams);
            response = await this.httpService.axiosRef({
                method: 'POST',
                url: `${this.icmApiUrl}/users/uploadDocs`,
                params: { ...docParams },
                data: form,
            });
            console.log(`upload docs response`, response?.data || response);
        } catch (error) {
            console.error(`error while uploading customer doc to b2c`, customer, attachment, error);
        }
        return response;
    }

    /**
     * Uploads the customer docs to B2C without download
     * @body UploadDocsDto
     * @returns AxiosResponse
     */
    async uploadPartnerDocs(file: Express.Multer.File, customer: Customer): Promise<AxiosResponse> {
        const form = new FormData();

        form.append('file', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });
        try {
            return this.httpService.axiosRef({
                method: 'POST',
                url: `${this.icmApiUrl}/users/uploadDocs`,
                params: {
                    email: customer.email,
                    pan: customer.pan_number,
                    type: B2CAttachmentTypeMap[file.fieldname],
                    token: customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
                },
                data: form,
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ uploadPartnerDocs ~ error:', error);
            throw new ServiceUnavailableException('Could not upload partner docs.');
        }
    }

    /**
     * Deletes the user doc from local server after uplaoding
     * @param filePath string
     *
     */
    private deleteFile(filePath: string): void {
        // Delete the file
        fs.unlinkSync(filePath);
        console.log(`Deleted file: ${filePath}`);
    }

    async autoKyc(access_token: string): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/orobonds/users/processUserDocuments`,
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ autoKyc ~ error:', error);
            throw new ServiceUnavailableException('Could not do KYC.');
        }
    }

    async setWhatsAppConsent(consent: boolean, access_token: string): Promise<any> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/users/setConsent`,
                    data: { consent, type: 'whatsapp' },
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ setWhatsAppConsent ~ error:', error);
            throw new ServiceUnavailableException('Could not setWhatsAppConsent.');
        }
    }

    /**
     * Get product price
     * @param params
     * @returns
     */
    async getProductPrice(params: {
        units: number;
        product_code: string;
        return_rate: number;
    }): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.icmApiUrl}/orobonds/getPrice`,
                params: {
                    product: params.product_code,
                    units: params.units,
                    expectedXirr: params.return_rate,
                },
                headers: {
                    'x-product': `orobonds:${params.product_code}`,
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getProductPrice ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get product price.',
            );
        }
    }

    /**
     * Validating pan number from ICM
     * @param api_token
     * @param pan_number
     * @returns AxiosResponse
     */
    async getPanDetails(api_token: string, params: ValidatePanDto): Promise<BondsRes> {
        try {
            const access = await this.getAccessTokenFromRefreshToken(api_token);
            const dob = format(new Date(params.birth_date), 'dd/MM/yyyy');
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/digioEsign/getUserNameFromPanV2`,
                    data: {
                        pan: params.pan_number,
                        dob: dob,
                        name: params.name,
                        product: 'oroBonds',
                    },
                    headers: { token: access.data.token, partnerId: this.icmPartnerId },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getPanDetails ~ error:', error);
            throw new ServiceUnavailableException('Could not get pan details.');
        }
    }

    /**
     * Save customer account details
     * @param customer
     * @returns
     */
    async updateBankAccount(customer: Customer): Promise<BondsRes> {
        const accountParams = {};
        accountParams['accountNumber'] = customer.account_number;
        accountParams['pan'] = customer.pan_number;
        accountParams['accountType'] = 'Savings';
        accountParams['ifsc'] = customer.ifsc_code;
        accountParams['name'] = customer.name;
        accountParams['product'] = 'orobonds';

        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/bank/accounts`,
                    data: { ...accountParams },
                    params: {
                        token: customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
                        source: 'icmAdvisory',
                    },
                    headers: {
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ updateBankAccount ~ error:', error);
            throw new ServiceUnavailableException('Could not update bank account.');
        }
    }

    /**
     * Validating demat number from ICM
     * @param dematId
     * @returns AxiosResponse
     */
    async validateDematNumber(demat_number: string, access_token: string): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/dpList/validate`,
                    data: { dpId: demat_number },
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ validateDematNumber ~ error:', error);
            throw new ServiceUnavailableException('Could not get demat details.');
        }
    }

    async getPennyDropStatus(
        request_id: string,
        access_token: string,
    ): Promise<BondsRes & { result: 'active' | 'invalid' | 'pending'; error: string }> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.icmApiUrl}/bse/banks/verify/status`,
                    params: { validationRequestId: request_id },
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getPennyDropStatus ~ error:', error);
            throw new ServiceUnavailableException('Could not get bank status.');
        }
    }

    async getVerificationToken(
        params: Customer,
    ): Promise<BondsRes & { result: any; error: string }> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/bse/banks/verify`,
                    data: {
                        name: params.name,
                        ifsc: params.ifsc_code,
                        accountNumber: params.account_number,
                    },
                    headers: {
                        token: params.getConnectionValue(ConnectionType.ICM, 'access_token'),
                        'x-product': 'oroBonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getVerificationToken ~ error:', error);
            throw new ServiceUnavailableException('Could not get banks verify details.');
        }
    }

    /**
     * Getting the investment amount from ICMB
     * @param payment
     * @param access_token
     * @returns
     */
    async getInvestmentAmount(payment: Payment, access_token: string): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.icmApiUrl}/orobonds/getInvestmentAmount`,
                    data: {
                        amount: payment.unit_price,
                        product: payment.product_code,
                        units: payment.units,
                        expectedXirr: payment.return_rate,
                    },
                    headers: {
                        token: access_token,
                        'x-product': `orobonds:${payment.product_code}`,
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getInvestmentAmount ~ error:', error);
            throw new ServiceUnavailableException('Could not get investment amount.');
        }
    }

    /**
     * Getting the investment amount from ICMB
     * @param payment
     * @param access_token
     * @returns
     */
    async getLeadInvestment(
        lead: Lead,
        unitPrice: string,
        productCode: string,
        access_token: string,
    ): Promise<BondsRes> {
        try {
            const resGetProduct = await this.getProduct(lead.product_isin);
            debugger;
            const resGetProductPrice = await this.getProductPrice({
                units: lead.product_units,
                product_code: resGetProduct.data.product,
                return_rate: lead.product_xirr,
            });
            debugger;

            return await this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/orobonds/getInvestmentAmount`,
                data: {
                    amount: unitPrice,
                    product: productCode,
                    units: lead.product_units,
                    expectedXirr: lead.product_xirr,
                },
                headers: {
                    token: access_token,
                    'x-product': `orobonds:${productCode}`,
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getInvestmentAmount ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get investment amount.',
            );
        }
    }

    /**
     * Creating purchase order from ICMB
     * @param payment
     * @param customer
     * @param access_token
     */
    async createOrder(
        payment: Payment,
        customer: CustomerDocument,
        account_code: string,
    ): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/orobonds/pg/purchase`,
                data: {
                    demat: customer.demat_number,
                    units: payment.units,
                    expectedXirr: payment.return_rate,
                    custId: customer.getConnectionValue(ConnectionType.ICM, 'kyc_id'),
                    pan: customer.pan_number,
                    product: payment.product_code,
                    ISIN: payment.product_isin,
                },
                headers: {
                    token: customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
                    'x-product': `orobonds:${payment.product_code}`,
                    'x-partner': `${this.icmPartnerId}:${account_code}`,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ createOrder ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not create purchase order.',
            );
        }
    }

    /**
     * Generating customer id in ICMB with KYC status
     *  pending, which is required for IPO.
     * @param access_token
     */
    async generateCustId(access_token: string): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.icmApiUrl}/orobonds/users/processUser`,
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ generateCustId ~ error:', error);
            throw new ServiceUnavailableException('Could not generate customer ID.');
        }
    }

    /**
     * Checking if the customer is KYC verified.
     * ICMB cutomer id is required to make payment.
     * @param access_token
     * @returns
     */
    async getCustomerId(access_token: string): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.icmApiUrl}/orobonds/users/getPans`,
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getCustomerId ~ error:', error);
            throw new ServiceUnavailableException('Could not get customer id.');
        }
    }

    /**
     * Getting the digigo payment link from ICMB
     * @param access_token
     * @returns
     */
    async getPaymentLink(payment: Payment, customer: Customer): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/orobonds/digio/getEsigningUrlForBonds`,
                data: {
                    Platform: 'web',
                    orderId: payment.order_id,
                    pan: customer.pan_number,
                    email: customer.email,
                },
                headers: {
                    token: customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getPaymentLink ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get payment link.',
            );
        }
    }

    username = this.configService.get<string>('CVLKRA.USERNAME');
    posCode = this.configService.get<string>('CVLKRA.POS_CODE');
    password = this.configService.get<string>('CVLKRA.PASSWORD');
    passKey = this.configService.get<string>('CVLKRA.PASS_KEY');

    /**
     * @param pan_number
     * @returns
     */
    async validatePanNumber(pan_number: string): Promise<any> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: 'https://www.cvlkra.com/PANInquiry.asmx/GetPanStatus',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    data: qs.stringify({
                        panNo: pan_number,
                        username: this.username,
                        posCode: this.posCode,
                        Password: this.password,
                        passKey: this.passKey,
                    }),
                })
                .then((res) => xml2js(res.data, { compact: true }));
        } catch (error) {
            console.log('🚀 ~ BondsService ~ validatePanNumber ~ error:', error);
            throw new ServiceUnavailableException('Could not validate pan number.');
        }
    }

    /**
     * @param access_token
     * @returns
     */
    async getProductTxns(product_code: string, access_token: string): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.icmApiUrl}/orobonds/pg/timeline`,
                    headers: {
                        token: access_token,
                        'x-product': `orobonds:${product_code}`,
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getProductTxns ~ error:', error);
            throw new ServiceUnavailableException('Could not get transaction timeline.');
        }
    }

    /**
     * Get all the products
     * @returns { data: Product[] }
     */
    async getProducts(): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/bonds`,
                headers: { 'x-partner': this.icmPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getProducts ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the products.',
            );
        }
    }

    /**
     * Get product by ISIN
     * @param product_isin string
     * @returns { data: Product }
     */
    async getProduct(isin: string): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/bonds/${isin}`,
                headers: { 'x-partner': this.icmPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getProduct ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the product.',
            );
        }
    }

    /**
     * Accept/Reject Transaction
     */
    async acceptRejectTxn(params: {
        transaction_id: string;
        ops_status: string;
        ops_remark?: string;
        customer_id: ObjectId;
    }): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/orobonds/admin/txns/${params.transaction_id}`,
                data: {
                    data: {
                        adminStatus: params.ops_status,
                        adminRemark: params?.ops_remark,
                    },
                    userId: params.customer_id,
                },
                headers: {
                    token: this.opsAdminAccessToken,
                    'x-product': 'oroBonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ acceptRejectTxn ~ error:', error);
            throw new ServiceUnavailableException(
                'Service not available, could not accept/reject transaction.',
            );
        }
    }

    /**
     * Approve or Reject Customer KYC
     */
    async acceptRejectKyc(
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
                    url: `${this.icmApiUrl}/adminV2/orobonds/${ActionMap[params.action]}`,
                    data: { ...customerParams },
                    headers: {
                        token: this.opsAdminAccessToken,
                        'x-product': 'oroBonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ acceptRejectKyc ~ error:', error);
            throw new ServiceUnavailableException('Could not update KYC.');
        }
    }

    /**
     * Get Customer Portfolio from B2C
     */
    async getCustomerPortfolioB2C(access_token: string): Promise<BondsRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'GET',
                    url: `${this.biddApiUrl}/orobonds/users/portfolio?consolidated=true`,
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.icmPartnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            // console.log('🚀 ~ BondsService ~ getCustomerPortfolio ~ error:', error);
            throw new ServiceUnavailableException('Could not get customer portfolio.');
        }
    }

    /**
     * Get Customer Docs from B2C in case of diy journey
     * @body pan_number
     */
    async getCustomerDocs(pan_number: string): Promise<BondsRes> {
        const attachmentTypeMap = {
            address: 'ADDRESS',
            pan: 'PAN',
            bank: 'CANCELLED_CHEQUE',
        };

        try {
            const resCustomerDocs = await this.request({
                method: 'POST',
                url: `${this.icmApiUrl}/admin/getUserDocsWithPan`,
                data: { pan: pan_number },

                headers: {
                    token: this.opsAdminAccessToken,
                    'x-product': 'oroBonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });

            if (!resCustomerDocs.success) {
                return resCustomerDocs;
            }

            return {
                success: true,
                data: resCustomerDocs.data.map((doc: any) => ({
                    ...doc,
                    type: attachmentTypeMap[doc.type],
                })),
            };
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getCustomerDocs ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable.');
        }
    }

    /**
     * Download Customer Docs from B2C
     * @body fileName
     * @body email
     */
    async downloadCustomerDocsB2C(fileName: string, email: string): Promise<any> {
        try {
            const response = await axios.post(
                `${this.icmApiUrl}/admin/v2/downloadDoc`,
                {
                    filename: fileName,
                    email: email,
                },
                {
                    headers: {
                        token: this.opsAdminAccessToken,
                        // 'x-product': 'oroBonds:default',
                        // 'x-partner': this.icmPartnerId,
                    },
                    responseType: 'stream', // ensure response type is stream
                },
            );

            const mimeType = response.headers['content-type'];

            return {
                stream: response.data,
                mimeType: mimeType,
            };
        } catch (error) {
            console.log('Error downloading file:', error);
            throw new ServiceUnavailableException('Service unavailable.');
        }
    }

    /**
     * Get Ace Data
     */
    async getAceData(): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `https://contentapi.accordwebservices.com/RawData/GetRawDataJSON?filename=Divdetails&date=20240314&section=MFNAV&token=79LoNyI0u1PjROeqgABFClbxIg5SZaO1`,
                // headers: {
                //     'x-product': 'orobonds:default',
                //     'x-partner': this.icmPartnerId,
                // },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getAceData ~ error:', error);
            throw new ServiceUnavailableException('Could not get ace data.');
        }
    }
}
