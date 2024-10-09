import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ConnectionType, Customer, CustomerDocument } from 'src/models';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import GetSwitchInOutTransactionsDto from 'src/app/backend/products/mutual-funds/dto/get-switch-in-out-transactions.dto';
import GetTaxFillingDto from 'src/app/backend/products/mutual-funds/dto/get-tax-filling.dto';

import { RedeemCartDto } from './dmo/redeem-cart.dto';
import { UpdateCartDto } from './dmo/update-cart.dto';
import { CheckoutCartDto } from './dmo/cart-checkout.dto';
import { UpdateStpCartDto } from './dmo/update-stp-cart.dto';
import { UpdateSipCartDto } from './dmo/update-sip-cart.dto';
import { UpdateSwpCartDto } from './dmo/update-swp-cart.dto';
import { GetTransactionsDto } from './dmo/get-transactions.dto';
import { UpdateRedeemCartDto } from './dmo/update-redeem-cart.dto';
import { UpdateSwitchCartDto } from './dmo/update-switch-cart.dto';
import { SipTransformDataDto } from './dmo/sip-data-transform.dto';
import { StpTransformDataDto } from './dmo/stp-data-transform.dto';

interface MutualFundRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export default class MutualFundService {
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,

        private readonly jwtService: JwtService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    mutualFundsApiUrl = this.configService.get<string>('MUTUAL_FUNDS_API_URL');
    mutualFundsAuthKey = this.configService.get<string>('MUTUAL_FUNDS_AUTH_KEY');
    apiPartnerId = 'oro'; //this.configService.get<string>('ICM_PARTNER_ID');
    accessToken = this.configService.get<string>('MUTUAL_FUNDS_ACCESS_TOKEN');
    mfPartnerId = this.configService.get<string>('ICM_PARTNER_ID');
    states = [
        'AN',
        'AR',
        'AP',
        'AS',
        'BH',
        'CH',
        'CG',
        'GO',
        'GU',
        'HA',
        'HP',
        'JM',
        'JK',
        'KA',
        'KE',
        'MP',
        'MA',
        'MN',
        'ME',
        'MI',
        'NA',
        'ND',
        'OR',
        'PO',
        'PU',
        'RA',
        'SI',
        'TG',
        'TN',
        'TR',
        'UP',
        'UC',
        'WB',
        'DN',
        'DD',
        'LD',
        'OH',
    ];

    /**
     * Add to cart products for lumpsum transaction
     * @param product_isin UpdateCartDto
     * @param jwt string
     */
    async addToCart(params: UpdateCartDto, jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/cart/insert`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ addToCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not add to cart.');
        }
    }

    /**
     * Add to cart products for redemption
     * @param product_isin UpdateCartDto
     * @param jwt string
     */
    async addToRedeemCart(params: UpdateRedeemCartDto, jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/rcart/insert`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ addToCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not add to cart.');
        }
    }

    /**
     * Add to cart products for swp
     * @param product_isin UpdateSwpCartDto
     * @param jwt string
     */
    async addToSwpCart(params: UpdateSwpCartDto, jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/swpcart/insert`,
                headers: {
                    'Content-Type': 'application/json',
                    token: jwt,
                    'X-partner': this.mfPartnerId,
                },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ addToSwpCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not add to cart.');
        }
    }

    /**
     * Add to cart products for stp
     * @param product_isin UpdateCartDto
     * @param jwt string
     */
    async addToStpCart(params: UpdateStpCartDto, jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/stpcart/insert`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ addToStpCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not add to cart.');
        }
    }

    /**
     * Add to cart products for redemption
     * @param product_isin UpdateCartDto
     * @param jwt string
     */
    async addToSwitchCart(params: UpdateSwitchCartDto, jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/scart/insert`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ addToCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not add to cart.');
        }
    }

    /**
     * Add to cart products for sip transaction
     * @param product_isin UpdateCartDto
     * @param jwt string
     */
    async addToSipCart(params: UpdateSipCartDto, jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/sipcart/insert`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ addToCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not add to cart.');
        }
    }

    /**
     * Checkouts all products in cart for lumpsum transaction and returns bse order ids
     * @param params CheckoutCartDto
     * @param customer Customer
     */
    async checkoutCart(params: CheckoutCartDto, customer) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/cart/checkout`,
                headers: { token: this.generateJWT(customer), 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ checkoutCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not checkout cart.');
        }
    }

    /**
     * Creates Customer Mandate for SIP transaction
     */
    async createCustomerMandate(b2cCustomer, customer) {
        const mandatePayload = {
            bankId: b2cCustomer.bankId,
            pan: b2cCustomer.pan,
            mandateType: 'emandate',
        };
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/account/banks/mandate`,
                headers: {
                    token: this.generateJWT(customer),
                    'X-partner': 'icmAdvisory',
                },
                data: { ...mandatePayload },
                timeout: 500000,
                keepAlive: true,
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ createCustomerMandate ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not create mandate.');
        }
    }

    /**
     * creates bse order for sip child order using registration ids
     * @param registarion_id string
     * @param jwt string
     */
    async createChildOrder(registarion_id: string, jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/sipcart/${registarion_id}/createChildOrder`,
                headers: { token: jwt, 'X-partner': 'icmAdvisory' },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ createChildOrder ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not checkout cart.');
        }
    }

    /**
     * Creates Customer UCC
     */
    async createCustomerUcc(b2cCustomer, jwt) {
        let uccPayload = {
            primaryHolder: {
                firstName: b2cCustomer.data.name, // mandatory
                middleName: '',
                lastName: '',
                email: b2cCustomer.data.email.replace(/\+.*@/, '@'),
                mobileNumberIndian: b2cCustomer.data.phone.replace('+91', ''),
                dob: b2cCustomer.data.dob.replace(/-/g, '/'), // mandatory
                pan: b2cCustomer.data.pan, // conditional mandatory if firstHolder.panExempt is N
                kycType: 'K', // mandatory - KRA: K, CKYC: C, Biometric KYC: B, eAadhaar eKYC PAN: E
            },
            taxStatus: '01', // mandatory - 1 for individual
            gender: b2cCustomer.data.gender, // conditional mandatory for individual and minor clients - M/F/O
            occupationCode: '01', // mandatory - Business: 01, Services: 02, Professional: 03, Agriculture: 04, Retired: 05, Housewife: 06, Student: 07, Others: 08
            holdingNature: 'SI', // mandatory - SI for individual
            bankAccounts: [
                // minimum 1, maximum 5 bank accounts
                {
                    accountType: 'SB', // mandatory Savings Account: SB - default is SB
                    accountNumber: b2cCustomer.data.accountNumber, // mandatory Account number
                    ifsc: b2cCustomer.data.ifscCode, // mandatory
                    defaultBankFlag: 'Y', // mandatory - Y/N
                },
            ],
            communication: {
                // conditional mandatory if not NRI
                address: {
                    line1: b2cCustomer.data.addressDetails.address.substring(0, 40), //b2cCustomer.data.addressDetails.address, // mandatory - maxLength: 40
                    // line2: '', // optional - maxLength: 40
                    // line3: '', // optional - maxLength: 40
                    city: b2cCustomer.data.addressDetails.districtOrCity, //b2cCustomer.data.addressDetails.districtOrCity, // mandatory
                    state: 'MA', //b2cCustomer.data.addressDetails.state, // mandatory
                    pincode: b2cCustomer.data.addressDetails.pincode, //b2cCustomer.data.addressDetails.pincode, // mandatory
                    country: b2cCustomer.data.addressDetails.country, // mandatory - default India
                },
            },
            // email: customer.email, // mandatory
            //mobileNumberIndian: customer.phone_number, // mandatory - maxLength: 10
            nomination: {
                opt: 'N',
                authMode: 'O',
                verificationLoopbackUrl: `https://uatmf.incredmoney.com/bse/nominations/verify/${b2cCustomer.data.pan}`, // to be replaced
            },
            // nominees: [
            //     // optional - upto 3 nominees - total applicable must be 100
            //     {
            //         name: 'test', // mandatory - maxLength: 40
            //         relationship: 'Mother', // mandatory - maxLength: 40
            //         applicable: 100.0, // mandatory - 5 digits, 2 decimals
            //         minor: 'N', // mandatory - Y/N
            //     },
            //     // other two optional nominees
            // ],
        };

        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/clients`,
                headers: {
                    token: jwt,
                    'X-partner': 'icmAdvisory',
                },
                data: { ...uccPayload },
                timeout: 500000,
                keepAlive: true,
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ createCustomerUcc ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not create ucc.');
        }
    }

    /**
     * Checkouts all products in cart for swpCart and returns bse order ids
     * @param params CheckoutCartDto
     * @param jwt string
     */
    async checkoutSwpCart(params: RedeemCartDto, customer) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/swpcart/checkout`,
                headers: {
                    'Content-Type': 'application/json',
                    token: this.generateJWT(customer),
                    'X-partner': this.mfPartnerId,
                },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ checkoutSwpCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not checkout cart.');
        }
    }

    /**
     * Checkouts all products in cart for lumpsum transaction and returns bse order ids
     * @param params CheckoutCartDto
     * @param jwt string
     */
    async checkoutRedeemCart(params: RedeemCartDto, customer) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/rcart/checkout`,
                headers: { token: this.generateJWT(customer), 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ checkoutCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not checkout cart.');
        }
    }

    /**
     * Checkouts all products in cart for stp transaction and returns bse order ids
     * @param params CheckoutCartDto
     * @param jwt string
     */
    async checkoutStpCart(params: CheckoutCartDto, customer) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/stpcart/checkout`,
                headers: { token: this.generateJWT(customer), 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ checkoutStpCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not checkout cart.');
        }
    }

    /**
     * Checkouts all products in cart for lumpsum transaction and returns bse order ids
     * @param params CheckoutCartDto
     * @param jwt string
     */
    async checkoutSwitchCart(params: CheckoutCartDto, customer) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/scart/checkout`,
                headers: { token: this.generateJWT(customer), 'X-partner': this.mfPartnerId },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ checkoutCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not checkout cart.');
        }
    }

    /**
     * Checkouts all products in cart for sip transaction and returns sip registarion ids
     * @param params CheckoutCartDto
     * @param jwt string
     */
    async checkoutSipCart(params: CheckoutCartDto, customer) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/sipcart/checkout`,
                headers: { token: this.generateJWT(customer), 'X-partner': 'icmAdvisory' },
                data: { ...params },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ checkoutSipCart ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not checkout cart.');
        }
    }

    /**
     * delete an item from cart
     * @param itemId string
     * @param jwt string
     */
    async deleteCartItem(jwt, itemId) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/cart/delete`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { itemId: itemId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * delete an item from cart
     * @param itemId string
     * @param jwt string
     */
    async deleteRedemptionCartItem(jwt, itemId) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/rcart/delete`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { itemId: itemId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ deleteRedemptionCartItem ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * delete an item from cart
     * @param itemId string
     * @param jwt string
     */
    async deleteSwpCartItem(jwt, itemId) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/swpcart/delete`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { itemId: itemId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ deleteSwpCartItem ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * delete an item from cart
     * @param itemId string
     * @param jwt string
     */
    async deleteStpCartItem(jwt, itemId) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/stpcart/delete`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { itemId: itemId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ deleteStpCartItem ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * delete an item from cart
     * @param itemId string
     * @param jwt string
     */
    async deleteSwitchCartItem(jwt, itemId) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/scart/delete`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { itemId: itemId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ deleteSwitchCartItem ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * delete an item from cart
     * @param itemId string
     * @param jwt string
     */
    async deleteSipCartItem(jwt, itemId) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/sipcart/delete`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
                data: { itemId: itemId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * Returns customer's available banks for transaction
     * @param params
     */
    async fetchBanks(params) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/account/banks`,
                headers: { token: this.generateJWT(params), 'X-partner': this.mfPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ fetchBanks ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the banks data.',
            );
        }
    }

    /**
     * returns the status of transaction with bse order id
      * @param jwt string
      * @param pan string
      * @param order_ids string[]
    }
     */
    async fetchMutualFundsPaymentStatus(jwt: string, pan: string, order_ids: string[]) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/paymentStatus`,
                headers: { token: jwt, 'X-partner': 'icmAdvisory' },
                data: {
                    pan: pan,
                    orderIds: order_ids,
                },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ fetchMutualFundsPaymentStatus ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get status.');
        }
    }

    /**
     * returns 2fa bse link
     * @param jwt string
     */
    async initiateTwoFactorAuth(jwt) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/cart/initiateTwoFactorAuthentication`,
                headers: { token: jwt, 'X-partner': 'icmAdvisory' },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ initiateTwoFactorAuth ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not initiate 2FA.');
        }
    }

    /**
     * Fetch customer mutual funds transactions
     * @param query GetCustomerTxnsDto
     * @param params string
     */
    async getCustomerTxns(getTransactionsDto: GetTransactionsDto) {
        try {
            const { userId, email, ...queryParams } = getTransactionsDto;
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/ios/portfolio/transactions`,
                params: { ...queryParams },
                headers: {
                    token: this.generateJWT({ userId, email }),
                    'x-partner': this.mfPartnerId,
                },
            });
        } catch (error) {
            // console.log('🚀 ~ MutualFundService ~ getCustomerTxns ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get customer transaction.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Fetch units for the folio number
     * @param params string
     * @param body GetFolioWiseUnitsDto
     */
    async getCustomerFolioWiseUnits(params, body) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/ios/folioWiseUnitsV2`,
                headers: { token: this.generateJWT(params), 'x-partner': this.mfPartnerId },
                data: { ...body },
            });
        } catch (error) {
            // console.log('🚀 ~ MutualFundService ~ getCustomerFolioWiseUnits ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not fetch portfolio units.',
            );
        }
    }

    generateJWT = ({ userId, email }) => {
        const jwtSecret = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');
        return this.jwtService.sign({ userId, email }, { secret: jwtSecret });
    };

    /**
     * get all items from swp cart
     * @param jwt string
     */
    async getAllSwpCartItems(jwt) {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/swpcart`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
            });
            return response.result;
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllSwpCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * get all items from stp cart
     * @param jwt string
     */
    async getAllStpCartItems(jwt) {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/stpcart`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
            });
            return response.result;
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllStpCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * get all items from redemption cart
     * @param jwt string
     */
    async getAllSwitchCartItems(jwt) {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/scart`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
            });
            return response.result;
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllSwitchCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * get all items from redemption cart
     * @param jwt string
     */
    async getAllRedemptionCartItems(jwt) {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/rcart`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
            });
            return response.result;
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllRedemptionCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * get all items from sip cart
     * @param jwt string
     */
    async getAllSipCartItems(jwt) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/sipcart`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllSipCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * get all items from cart
     * @param jwt string
     */
    async getAllCartItems(jwt) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/cart`,
                headers: { token: jwt, 'X-partner': this.mfPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getAllCartItems ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart.');
        }
    }

    /**
     * Fetch latest status for e-mamndate using mandate_id
     * @param mandate_id string
     * @param params string
     */
    async getMandateStatus(mandate_id, params) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/mandates/${mandate_id}`,
                headers: { token: this.generateJWT(params), 'X-partner': this.mfPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getMandateStatus ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not fetch latest mandate status.',
            );
        }
    }

    /**
     * Get all mutual fund Nav by amfi_code
     * @param amfi_code string
     */
    async getMutualFundNav(amfi_code: string, previous?: number) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/nc/allnavsV2?scode=${amfi_code}&previous=${previous}`,
                headers: { 'x-partner': this.apiPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getMutualFundNav ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the NAV data.',
            );
        }
    }

    /**
     * Creates Customer Mandate e-sign url
     */
    async generateMandateUrl(b2cCustomer, customer) {
        const mandateUrlPayload = {
            bankId: b2cCustomer.bankId,
            pan: b2cCustomer.pan,
            mandateType: 'emandate',
        };
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/account/banks/generateMandateUrl`,
                headers: {
                    token: this.generateJWT(customer),
                    'X-partner': 'icmAdvisory',
                },
                data: { ...mandateUrlPayload },
                timeout: 500000,
                keepAlive: true,
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ generateMandateUrl ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not create mandate e-sign url.',
            );
        }
    }

    /**
     * Get sip dates for  by ISIN
     * @param product_isin string
     */
    async getMutualFundSipDates(product_isin: string): Promise<MutualFundRes> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/funds/${product_isin}/sip`,
                headers: { 'x-partner': this.apiPartnerId },
            });

            if (response.success) {
                const transformedData = response.data.frequencies.map((frequencyData) => {
                    return new SipTransformDataDto(frequencyData);
                });

                return { success: true, data: transformedData };
            }

            return { success: false };
        } catch (error) {
            console.log('🚀 ~ getMutualFundSipDates ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the dates for sip.',
            );
        }
    }

    /**
     * Get swp Info by ISIN
     * @param product_isin string
     */
    async getMutualFundSwpInfo(product_isin: string): Promise<MutualFundRes> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/funds/${product_isin}/swp`,
                headers: { 'x-partner': this.apiPartnerId },
            });

            if (response.success) {
                const transformedData = response.data.frequencies.map((frequencyData) => {
                    return new StpTransformDataDto(frequencyData);
                });

                return { success: true, data: transformedData };
            }

            return { success: false };
        } catch (error) {
            console.log('🚀 ~ getMutualFundSipDates ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the dates for sip.',
            );
        }
    }

    /**
     * Get sip dates for  by ISIN
     * @param product_isin string
     */
    async getMutualFundStpDates(product_isin: string): Promise<MutualFundRes> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/funds/${product_isin}/stp`,
                headers: { 'x-partner': this.apiPartnerId },
            });

            if (response.success) {
                const transformedData = response.data.frequencies.map((frequencyData) => {
                    return new StpTransformDataDto(frequencyData);
                });

                return { success: true, data: transformedData };
            }

            return { success: false };
        } catch (error) {
            console.log('🚀 ~ getMutualFundSipDates ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the dates for sip.',
            );
        }
    }

    /**
     * Get all the products
     * @returns { data: MutualFund[] }
     */
    async getProducts(params: {
        page: number;
        per_page: number;
        name: string;
    }): Promise<MutualFundRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/funds`,
                params: {
                    page: params.page - 1,
                    pageSize: params.per_page,
                    search: params.name,
                },
                headers: { 'x-partner': this.apiPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getProducts ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the products.',
            );
        }
    }

    /**
     * Get product by ISIN
     * @param product_isin string
     * @returns { data: MutualFund }
     */
    async getProduct(isin: string): Promise<MutualFundRes> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/funds/${isin}`,
                headers: { 'x-partner': this.apiPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getProduct ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get the product.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * returns html response to start payment for lumpsum transactions
     * @param params {
        redirection_url: string;
        order_ids: string[];
        jwt: string;
        paymentType: string;
        bankId: string;
        vpaId: string;
        utr_number: string;
    }
     */
    async getPaymentLink(params: {
        redirection_url: string;
        order_ids: string[];
        jwt: string;
        paymentType: string;
        bankId: string;
        vpaId: string;
        utr_number: string;
    }) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/cart/Payment`,
                headers: { token: params.jwt, 'X-partner': 'icmAdvisory' },
                data: {
                    bankId: params.bankId,
                    paymentType: params.paymentType,
                    vpaId: params.vpaId,
                    cartType: 'cart',
                    orderIds: params.order_ids,
                    platform: 'web',
                    redirectUrl: params.redirection_url,
                    NEFTReferenceNumber: params.utr_number,
                },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getPaymentLink ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get payment link.',
            );
        }
    }

    /**
     * Get product by ISIN
     * @param product_isin string
     * @returns { data: MutualFund }
     */
    async getSwitchToFunds(product_isin: string, is_stp): Promise<MutualFundRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/bse/funds/${product_isin}/availableFundsToSwitchOut?isStp=${is_stp}`,
                headers: { 'x-partner': this.apiPartnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getSwitchToFunds ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the product.',
            );
        }
    }

    /**
     * Fetch customer mutual funds portfolio
     * @param pan string
     * @param params string
     */
    async getMfPortfolio(pan, params) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/ios/getPortfolioV2`,
                headers: { token: this.generateJWT(params), 'x-partner': this.mfPartnerId },
                data: { pan: pan },
            });
        } catch (error) {
            // console.log('🚀 ~ MutualFundService ~ getMfPortfolio ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not fetch portfolio.',
            );
        }
    }
    /**
     * Get mutual fund GainLoss, Dividend and YearWise Summary
     * @param customer_id string
     * @returns { data: MutualFund }
     */
    async getMfTaxReportData(
        customer_id: string,
        getTaxFillingDto: GetTaxFillingDto,
    ): Promise<any> {
        const customer = await this.customerModel.findById(customer_id);
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/ios/reports/taxFilingReportV3`,
                params: {
                    year: getTaxFillingDto.year,
                },
                headers: {
                    token: jwt,
                    'X-partner': this.mfPartnerId,
                },
            });
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });
            console.log('🚀 ~ MutualFundService ~ getMFTaxFillingData ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get tax filling data.',
            );
        }
    }

    /**
     * Get mutual fund chart data
     * @param customer_id string
     * @returns { data: MutualFund }
     */
    async getMfTaxChartData(customer_id: string): Promise<any> {
        const customer = await this.customerModel.findById(customer_id);
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/ios/getGraphV2`,
                headers: {
                    token: jwt,
                    'X-partner': this.mfPartnerId,
                },
            });
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });
            console.log('🚀 ~ MutualFundService ~ getMFTaxChartData ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get tax chart data.',
            );
        }
    }

    /**
     * Get mutual fund IFA transactions
     * @param sub_broker_code string
     * @returns { data: MutualFund }
     */
    async getMFTransactionIFAData(sub_broker_code: string): Promise<any> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/ifa/${sub_broker_code}/transactions`,
                headers: {
                    Authorization: `Bearer ${this.mutualFundsAuthKey}`,
                    'X-partner': 'icmAdvisory',
                },
            });
            return response;
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });

            const defaultMessage = 'Service unavailable, could not get user transaction.';
            return { success: false, message: error.response.data.message ?? defaultMessage };
        }
    }

    /**
     * Get mutual fund IFA switch in transactions
     * @param sub_broker_code string
     * @returns { data: MutualFund }
     */
    async getMFTransactionSwitchInIFAData(sub_broker_code: string): Promise<any> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/ifa/${sub_broker_code}/switch-in-transactions`,
                headers: {
                    Authorization: `Bearer ${this.mutualFundsAuthKey}`,
                    'X-partner': 'icmAdvisory',
                },
            });
            return response;
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });
            const defaultMessage = 'Service unavailable, could not get user switch in transaction.';
            return { success: false, message: error.response.data.message ?? defaultMessage };
        }
    }

    /**
     * Get mutual fund IFA switch out transactions
     * @param sub_broker_code string
     * @returns { data: MutualFund }
     */
    async getMFTransactionSwitchOutIFAData(sub_broker_code: string): Promise<any> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/ifa/${sub_broker_code}/switch-out-transactions`,
                headers: {
                    Authorization: `Bearer ${this.mutualFundsAuthKey}`,
                    'X-partner': 'icmAdvisory',
                },
            });
            return response;
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });

            const defaultMessage =
                'Service unavailable, could not get user switch out transaction.';
            return { success: false, message: error.response.data.message ?? defaultMessage };
        }
    }

    getRandomState(arr) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    /**
     * returns html response to start payment for sip transactions
     * @param params {
        redirection_url: string;
        order_ids: string[];
        jwt: string;
        paymentType: string;
        bankId: string;
        vpaId: string;
        utr_number: string;
    }
     */
    async getSipPaymentLink(params: {
        redirection_url: string;
        order_ids: string[];
        jwt: string;
        paymentType: string;
        bankId: string;
        vpaId: string;
        utr_number: string;
    }) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/sipcart/Payment`,
                headers: { token: params.jwt, 'X-partner': 'icmAdvisory' },
                data: {
                    bankId: params.bankId,
                    paymentType: params.paymentType,
                    vpaId: params.vpaId,
                    cartType: 'cart',
                    orderIds: params.order_ids,
                    platform: 'web',
                    NEFTReferenceNumber: params.utr_number,

                    //redirectUrl: params.redirection_url,
                },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ getPaymentLink ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get payment link.',
            );
        }
    }

    /**
     * Get mutual fund switch-in / in-flow transactions
     * @param customer_id string
     * @returns { data: MutualFund }
     */
    async getTransactionInFlowData(
        customer_id: string,
        getSwitchInTransactionsDto: GetSwitchInOutTransactionsDto,
    ): Promise<any> {
        const customer = await this.customerModel.findById(customer_id);
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/txHistory/switch-in-transactions`,
                params: {
                    page: getSwitchInTransactionsDto.page,
                    limit: getSwitchInTransactionsDto.limit,
                    date: getSwitchInTransactionsDto.date,
                },
                headers: {
                    token: jwt,
                    'x-partner': this.mfPartnerId,
                },
            });
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });
            console.log('🚀 ~ MutualFundService ~ getMFSwitchInFlow ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get mf switch in data.',
            );
        }
    }

    /**
     * Get mutual fund switch-out / out-flow transactions
     * @param customer_id string
     * @returns { data: MutualFund }
     */
    async getTransactionOutFlowData(
        customer_id: string,
        getSwitchOutTransactionsDto: GetSwitchInOutTransactionsDto,
    ): Promise<any> {
        const customer = await this.customerModel.findById(customer_id);
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        try {
            return await this.request({
                method: 'GET',
                url: `${this.mutualFundsApiUrl}/txHistory/switch-out-transactions`,
                params: {
                    page: getSwitchOutTransactionsDto.page,
                    limit: getSwitchOutTransactionsDto.limit,
                    date: getSwitchOutTransactionsDto.date,
                },
                headers: {
                    token: jwt,
                    'x-partner': this.mfPartnerId,
                },
            });
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });
            console.log('🚀 ~ MutualFundService ~ getMFSwitchOutFlow ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get mf switch out data.',
            );
        }
    }

    /**
     * Get mutual fund carts like, sipCart, switchCart, redeemCart data
     * @param customer_id string
     * @returns { data: MutualFund }
     */
    async getTransactionTimelineData(customer_id: string): Promise<any> {
        const customer = await this.customerModel.findById(customer_id);
        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/txHistory/timelineNew`,
                headers: {
                    token: jwt,
                    'X-partner': this.mfPartnerId,
                },
            });
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? error.response.data : null,
            });
            console.log('🚀 ~ MutualFundService ~ getMFCartData ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not get cart data.');
        }
    }

    async pollOrder(order_ids: string[]) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/cart`,
                headers: { token: this.accessToken, 'x-partner': this.apiPartnerId },
                data: { bseOrderIds: order_ids },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ pollOrder ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not poll order.');
        }
    }

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    async refreshToken(customer_email: string) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/auth/login`,
                headers: { 'x-partner': this.apiPartnerId },
                data: {
                    email: customer_email,
                    password: 'admin123',
                    source: 'iosApp',
                },
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ refreshToken ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get access token.',
            );
        }
    }

    /**
     * Updates Customer UCC
     */
    async updateCustomerUcc(b2cCustomer, jwt) {
        let uccPayload = {
            primaryHolder: {
                firstName: b2cCustomer.data.name, // mandatory
                middleName: '',
                lastName: '',
                email: b2cCustomer.data.email.replace(/\+.*@/, '@'),
                mobileNumberIndian: b2cCustomer.data.phone.replace('+91', ''),
                dob: b2cCustomer.data.dob.replace(/-/g, '/'), // mandatory
                //pan: b2cCustomer.data.pan, // conditional mandatory if firstHolder.panExempt is N
                kycType: 'K', // mandatory - KRA: K, CKYC: C, Biometric KYC: B, eAadhaar eKYC PAN: E
            },
            taxStatus: '01', // mandatory - 1 for individual
            gender: b2cCustomer.data.gender, // conditional mandatory for individual and minor clients - M/F/O
            occupationCode: '01', // mandatory - Business: 01, Services: 02, Professional: 03, Agriculture: 04, Retired: 05, Housewife: 06, Student: 07, Others: 08
            holdingNature: 'SI', // mandatory - SI for individual
            bankAccounts: [
                // minimum 1, maximum 5 bank accounts
                {
                    accountType: 'SB', // mandatory Savings Account: SB - default is SB
                    accountNumber: b2cCustomer.data.accountNumber, // mandatory Account number
                    ifsc: b2cCustomer.data.ifscCode, // mandatory
                    defaultBankFlag: 'Y', // mandatory - Y/N
                },
            ],
            communication: {
                // conditional mandatory if not NRI
                address: {
                    line1: b2cCustomer.data.addressDetails.address.substring(0, 40), //b2cCustomer.data.addressDetails.address, // mandatory - maxLength: 40
                    // line2: '', // optional - maxLength: 40
                    // line3: '', // optional - maxLength: 40
                    city: b2cCustomer.data.addressDetails.districtOrCity, //b2cCustomer.data.addressDetails.districtOrCity, // mandatory
                    state: this.getRandomState(this.states), //b2cCustomer.data.addressDetails.state, // mandatory
                    pincode: b2cCustomer.data.addressDetails.pincode, //b2cCustomer.data.addressDetails.pincode, // mandatory
                    country: b2cCustomer.data.addressDetails.country, // mandatory - default India
                },
            },
            // email: customer.email, // mandatory
            //mobileNumberIndian: customer.phone_number, // mandatory - maxLength: 10
            nomination: {
                opt: 'N',
                authMode: 'O',
                verificationLoopbackUrl: `https://uatmf.incredmoney.com/bse/nominations/verify/${b2cCustomer.data.pan}`, // to be replaced
            },
            // nominees: [
            //     // optional - upto 3 nominees - total applicable must be 100
            //     {
            //         name: 'test', // mandatory - maxLength: 40
            //         relationship: 'Mother', // mandatory - maxLength: 40
            //         applicable: 100.0, // mandatory - 5 digits, 2 decimals
            //         minor: 'N', // mandatory - Y/N
            //     },
            //     // other two optional nominees
            // ],
        };

        try {
            return await this.request({
                method: 'POST',
                url: `${this.mutualFundsApiUrl}/bse/clients/update`,
                headers: {
                    token: jwt,
                    'X-partner': 'icmAdvisory',
                },
                data: { ...uccPayload },
                timeout: 500000,
                keepAlive: true,
            });
        } catch (error) {
            console.log('🚀 ~ MutualFundService ~ createCustomerUcc ~ error:', error);
            throw new ServiceUnavailableException('Service unavailable, could not create ucc.');
        }
    }
}
