import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubmitFullKycDataDto } from './dto/bonds-hyper-verge.dto';

interface HyperVergeRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export default class BondsHyperVergeService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    bondsApiUrl = this.configService.get<string>('ICM_API_URL');
    biddApiUrl = this.configService.get<string>('BIDD_API_URL');

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    async refreshToken(token: string) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.bondsApiUrl}/hyperverge/getToken`,
                headers: { token: token },
            });
        } catch (error) {
            console.log('🚀 ~ BondsHyperVergeService ~ refreshToken ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get access token.',
            );
        }
    }

    async getInitialData(token: string) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.bondsApiUrl}/hyperverge/initialdata`,
                headers: { token: token },
            });
        } catch (error) {
            console.log('🚀 ~ BondsHyperVergeService ~ getInitialData ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get initial data.',
            );
        }
    }

    async submitFullKycData(token: string, data: Partial<SubmitFullKycDataDto>) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.biddApiUrl}/hyperverge/submitFullKycData`,
                headers: { token },
                data: data,
            });
        } catch (error) {
            console.log(error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not submit full kyc data',
            );
        }
    }

    async getPollingData(token: string) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.bondsApiUrl}/hyperverge/user`,
                headers: { token: token },
            });
        } catch (error) {
            console.log('🚀 ~ BondsHyperVergeService ~ getInitialPollingData ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not get polling data.',
            );
        }
    }
}
