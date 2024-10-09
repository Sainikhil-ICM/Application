import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AppEnv } from 'src/constants/app.const';

@Injectable()
export default class Msg91Service {
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    appEnv = this.configService.get<string>('APP_ENV');
    isInCredValuePlus = this.appEnv === AppEnv.ICVP;

    // https://docs.msg91.com/sms/send-sms?version=V5
    async sendMessage(mobile: string, otp: string): Promise<AxiosResponse> {
        const BASE_URL = this.configService.get<string>('MSG91.BASE_URL');
        const AUTH_KEY = this.configService.get<string>('MSG91.AUTH_KEY');

        const request = this.httpService.post(
            `${BASE_URL}/otp`,
            {
                template_id: this.isInCredValuePlus
                    ? '663b2026d6fc0571c210f653'
                    : '646c6f98d6fc056c90739996',
                mobile,
                otp,
            },
            { headers: { authkey: AUTH_KEY } },
        );

        return firstValueFrom(request);
    }
}
