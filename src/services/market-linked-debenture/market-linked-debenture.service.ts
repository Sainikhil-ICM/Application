import { ResData } from 'types';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GetPriceResp } from './dto/get-price.dto';
import { CustomerDocument, ConnectionType } from 'src/models';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateOrderDmo, CreateOrderResp } from './dto/create-order.dmo';
import { GetPaymentLinkDmo, GetPaymentLinkResp } from './dto/get-payment-link.dmo';

interface ListedBondRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export default class MarketMarketLinkedDebentureService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    biddApiUrl = this.configService.get<string>('BIDD_API_URL');
    partnerId = this.configService.get<string>('ICM_PARTNER_ID');

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
        ...createOrderDmo
    }: CreateOrderDmo): Promise<ResData<CreateOrderResp>> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.biddApiUrl}/orobonds/pg/purchase`,
                data: { ...createOrderDmo },
                headers: {
                    token: accessToken,
                    'x-product': `orobonds:${createOrderDmo.product}`,
                    'x-partner': `${this.partnerId}:${createOrderDmo.accountCode}`,
                },
            });
        } catch (error) {
            console.log('🚀 ~ MarketLinkedDebentureService ~ createOrder ~ error:', error);
            const defaultMessage = 'Service unavailable, could not create purchase order.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Get unlisted product price
     * @param params
     * @returns
     */
    async getPrice(params: { units: number; code: string }): Promise<ResData<GetPriceResp>> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/getPrice`,
                params: { product: params.code, units: params.units },
                headers: {
                    'x-product': `orobonds:${params.code}`,
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ MarketLinkedDebentureService ~ getPrice ~ error:', error);
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
            console.log('🚀 ~ MarketLinkedDebentureService ~ getProducts ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get the products.';
            return { success: false, message: error.message ?? defaultMessage };
        }
    }

    /**
     * Get product by ISIN
     * @param isin string
     * @returns { data: Product }
     */
    async getProduct(isin: string): Promise<ListedBondRes> {
        try {
            return this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/bonds/${isin}`,
                headers: { partnerId: this.partnerId },
            });
        } catch (error) {
            console.log('🚀 ~ MarketLinkedDebentureService ~ getProduct ~ error:', error);
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
        ...getPaymentLinkDmo
    }: GetPaymentLinkDmo): Promise<ResData<GetPaymentLinkResp>> {
        try {
            return this.request({
                method: 'POST',
                url: `${this.biddApiUrl}/orobonds/digio/getEsigningUrlForBonds`,
                data: { ...getPaymentLinkDmo },
                headers: {
                    token: accessToken,
                    'x-product': 'orobonds:default',
                    'x-partner': this.partnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ MarketLinkedDebentureService ~ getPaymentLink ~ error:', error);
            const defaultMessage = 'Service unavailable, could not get payment link.';
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
            console.log('🚀 ~ MarketLinkedDebentureService ~ refreshToken ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not refresh access token.',
            );
        }
    }
}
