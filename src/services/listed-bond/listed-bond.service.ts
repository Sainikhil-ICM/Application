import { ResData } from 'types';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GetPriceResp } from './dto/get-price.dto';
import { GetProductResp } from './dto/get-product.dto';
import { CustomerDocument, ConnectionType } from 'src/models';
import { GetTransactionsResp } from './dto/get-transactions.dto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateOrderDto, CreateOrderResp } from './dto/create-order.dto';
import { GetInvestmentDto, GetInvestmentResp } from './dto/get-investment.dto';
import { GetPaymentLinkDto, GetPaymentLinkResp } from './dto/get-payment-link.dto';
import { CreateProductDto } from 'src/app/backend/products/listed-bonds/dto/create-product.dto';

interface ListedBondRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export default class ListedBondService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    biddApiUrl = this.configService.get<string>('BIDD_API_URL');
    partnerId = this.configService.get<string>('ICM_PARTNER_ID');
    opsAdminAccessToken = this.configService.get<string>('OPS_ADMIN_ACCESS_TOKEN');

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    /**
     * Creating purchase order from ICMB
     * @param payment
     * @param customer
     * @param access_token
     */
    async createOrder({
        accessToken,
        ...createOrderDto
    }: CreateOrderDto): Promise<ResData<CreateOrderResp>> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.biddApiUrl}/orobonds/pg/purchase`,
                data: { ...createOrderDto },
                headers: {
                    'Content-Type': 'application/json',
                    token: accessToken,
                    'x-product': `orobonds:${createOrderDto.product}`,
                    'x-partner': `${this.partnerId}:${createOrderDto.accountCode}`,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ createOrder ~ error:', error);
            const defaultMessage = 'Service unavailable, could not create purchase order.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Create a product
     * @returns { data: Product }
     */
    async createProduct(body: CreateProductDto): Promise<ListedBondRes> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.biddApiUrl}/orobonds/bonds`,
                data: {
                    isin: body.ISIN,
                    params: body,
                },
                headers: {
                    token: this.opsAdminAccessToken,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ CreateProduct ~ error:', error);
            throw new ServiceUnavailableException('Could not create Product.');
        }
    }

    /**
     * Get Customer Portfolio from B2C
     */
    async getCustomerPortfolio(access_token: string): Promise<ListedBondRes> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/users/portfolio`,
                params: { consolidated: true },
                headers: {
                    token: access_token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondsService ~ getCustomerPortfolio ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get customer portfolio.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Get all the Unlisted products
     * @returns { data: Product[] }
     */
    async getCustomerUnlistedPortfolio(token: string): Promise<ListedBondRes> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/unlisted/equities/portfolio`,
                headers: {
                    token: token,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ getCustomerUnlistedPortfolio ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the products.',
            );
        }
    }

    /**
     * Getting the investment amount from ICMB
     * @param payment
     * @param access_token
     * @returns
     */
    async getInvestment({
        accessToken,
        ...dataParams
    }: GetInvestmentDto): Promise<ResData<GetInvestmentResp>> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.biddApiUrl}/orobonds/getInvestmentAmount`,
                data: { ...dataParams },
                headers: {
                    token: accessToken,
                    'x-product': `orobonds:${dataParams.product}`,
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ getInvestment ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get investment amount.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Get unlisted product price
     * @param params
     * @returns
     */
    async getPrice(params: {
        units: number;
        code: string;
        return_rate: number;
    }): Promise<ResData<GetPriceResp>> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/getPrice`,
                params: {
                    product: params.code,
                    units: params.units,
                    expectedXirr: params.return_rate,
                },
                headers: {
                    'x-product': `orobonds:${params.code}`,
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ getPrice ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get product price.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Get all the Unlisted products
     * @returns { data: Product[] }
     */
    async getProducts(): Promise<ListedBondRes> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/bonds`,
                headers: { partnerId: this.partnerId },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ getProducts ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get the products.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Get product by ISIN
     * @param isin string
     * @returns { data: Product }
     */
    async getProduct(isin: string): Promise<ResData<GetProductResp>> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/bonds/${isin}`,
                headers: { partnerId: this.partnerId },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ getProduct ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get the product.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Getting the digigo payment link from ICMB
     * @returns
     */
    async getPaymentLink({
        accessToken,
        ...getPaymentLinkDto
    }: GetPaymentLinkDto): Promise<ResData<GetPaymentLinkResp>> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.biddApiUrl}/orobonds/digio/getEsigningUrlForBonds`,
                data: { ...getPaymentLinkDto },
                headers: {
                    token: accessToken,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ getPaymentLink ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get payment link.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async getPriceList(params: { product_code: string }): Promise<ListedBondRes> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/unlisted/equities/${params.product_code}/prices/all`,
                headers: {
                    'x-product': `orobonds:${params.product_code}`,
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ getPriceList ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get product prices.',
            );
        }
    }

    /**
     * @param access_token
     * @returns
     */
    async getTransactions(
        productCode: string,
        accessToken: string,
    ): Promise<ResData<GetTransactionsResp>> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/pg/timeline`,
                headers: {
                    token: accessToken,
                    'x-product': `orobonds:${productCode}`,
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getProductTxns ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get transaction timeline.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    async refreshToken(customer: CustomerDocument): Promise<ListedBondRes> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/partners/icmAdvisory`,
                params: {
                    verify_token: customer.getConnectionValue(ConnectionType.ICM, 'refresh_token'),
                    pid: '40',
                    source: 'icmAdvisory',
                },
                headers: {
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ ListedBondService ~ refreshToken ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not refresh access token.',
            );
        }
    }
}
