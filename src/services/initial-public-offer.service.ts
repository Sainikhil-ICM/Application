import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'src/models/payment.model';

interface IpoRes {
    success: boolean;
    data?: any;
    message?: string;
}

enum OrgMap {
    ICMP000 = 'ICMP000', // Others
    ICMP001 = 'ICMP001', // InCred Money
    ICMP002 = 'ICFS001', // InCred Wealth
    ICMP003 = 'ICMP003', // InCred Premier
    ICMP004 = 'ICMP004', // InCred Value Plus
}

@Injectable()
export default class InitialPublicOfferService {
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
     * Get all the Unlisted products
     * @returns { data: Product[] }
     */
    async getProducts(): Promise<IpoRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/bonds`,
                headers: { partnerId: this.partnerId },
            });
        } catch (error) {
            console.log('🚀 ~ InitialPublicOfferService ~ getProducts ~ error:', error);
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
    async getProduct(isin: string): Promise<IpoRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.biddApiUrl}/orobonds/bonds/${isin}`,
                headers: { partnerId: this.partnerId },
            });
        } catch (error) {
            console.log('🚀 ~ InitialPublicOfferService ~ getProduct ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get the product.',
            );
        }
    }

    /**
     * @param pan_number
     * @returns
     */
    async cancelPurchaseOrder(order_id: string, access_token: string): Promise<IpoRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.biddApiUrl}/orobonds/pg/ipo/cancelApplication`,
                    data: { orderId: order_id },
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.partnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ cancelPurchaseOrder ~ error:', error);
            throw new ServiceUnavailableException('Could not cancel purchase order.');
        }
    }

    /**
     * @param access_token
     * @returns
     */
    async getPurchaseOrder(order_id: string, access_token: string): Promise<IpoRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.biddApiUrl}/orobonds/pg/ipo/status`,
                    data: { orderId: order_id },
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': this.partnerId,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ IpoService ~ getPurchaseOrder ~ error:', error);
            throw new ServiceUnavailableException('Could not get purchase order details.');
        }
    }

    /**
     * Creating purchase order from ICMB
     * @param payment
     * @param customer
     * @param access_token
     */
    async purchaseIpoOrder(
        params: {
            product_isin: string;
            account_code: string;
            customer_upi?: string;
            payments: Payment[];
        },
        access_token: string,
    ): Promise<IpoRes> {
        const bidAmount = Object.values(params.payments).reduce(
            (total: number, item) => total + item.user_amount,
            0,
        );

        const purchaseParams = {};
        purchaseParams['ISIN'] = params.product_isin;
        purchaseParams['memberCode'] = OrgMap[params.account_code] ?? 'ICMP001';
        purchaseParams['series'] = params.payments.map((item) => {
            return { ISIN: item.product_isin, units: item.units };
        });

        if (bidAmount <= 500000) {
            purchaseParams['upiId'] = params.customer_upi;
        }

        console.log('🚀 ~ file: ipo.service.ts:106 ~ IpoService ~ purchaseParams:', purchaseParams);

        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.biddApiUrl}/orobonds/pg/ipo/bid`,
                    data: { ...purchaseParams },
                    headers: {
                        token: access_token,
                        'x-product': 'orobonds:default',
                        'x-partner': `${this.partnerId}:${params.account_code}`,
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ purchaseIpoOrder ~ error:', error);
            throw new ServiceUnavailableException('Could not place the IPO bid.');
        }
    }
}
