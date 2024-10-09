import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

type RefreshAccessTokenRes = {
    access_token: string;
    expires_in: number;
    api_domain: string;
    token_type: string;
};

type CreateRecordProps =
    | { recordType: 'Vendors'; data: CreateVendorDto }
    | { recordType: 'Orders'; data: CreateOrderDto };

type UpdateRecordProps =
    | { recordType: 'Vendors'; data: UpdateVendorDto }
    | { recordType: 'Orders'; data: UpdateOrderDto };

@Injectable()
export default class ZohoService {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    apiUrl = this.configService.get<string>('ZOHO.API_URL');
    accountsUrl = this.configService.get<string>('ZOHO.ACCOUNTS_URL');
    clientId = this.configService.get<string>('ZOHO.CLIENT_ID');
    clientSecret = this.configService.get<string>('ZOHO.CLIENT_SECRET');
    refreshToken = this.configService.get<string>('ZOHO.REFRESH_TOKEN');
    accessToken = '1000.1b735a8c33605ef4b9825fdd6ced703f.4db09242ea97fdb0ca542548b2ed1df8';

    /**
     * https://www.zoho.com/writer/help/api/v1/oauth-step4.html
     * TODO - cron job to refresh the token every hour on redis/file
     */

    async refreshAccessToken(): Promise<RefreshAccessTokenRes> {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.accountsUrl}}/oauth/v2/token`,
                    params: {
                        refresh_token: this.refreshToken,
                        client_id: this.clientId,
                        client_secret: this.clientSecret,
                        grant_type: 'refresh_token',
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ ZohoService ~ refreshAccessToken ~ error:', error);
            throw new ServiceUnavailableException('Could not refresh the access token.');
        }
    }

    async createRecord(params: CreateRecordProps) {
        try {
            return this.httpService
                .axiosRef({
                    method: 'POST',
                    url: `${this.apiUrl}/crm/v6/${params.recordType}`,
                    headers: { Authorization: `Zoho-oauthtoken ${this.accessToken}` },
                    data: {
                        data: [params.data],
                        trigger: ['approval', 'workflow', 'blueprint'],
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ ZohoService ~ createRecord ~ error:', error);
            throw new ServiceUnavailableException('Could not create the record.');
        }
    }

    async updateRecord(params: UpdateRecordProps) {
        try {
            this.httpService
                .axiosRef({
                    method: 'PUT',
                    url: `${this.apiUrl}/crm/v6/${params.recordType}/${params.data.Id}`,
                    headers: { Authorization: `Zoho-oauthtoken ${this.accessToken}` },
                    data: {
                        data: [params.data],
                        trigger: [],
                    },
                })
                .then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ ZohoService ~ updateRecord ~ error:', error);
            throw new ServiceUnavailableException('Could not update the record.');
        }
    }
}
