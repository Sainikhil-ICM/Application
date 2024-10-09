import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument, ConnectionType } from 'src/models/customer.model';
import { leads } from './data';
import UtilityService from 'src/services/utility.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { UserCustomer, UserCustomerDocument } from 'src/models/user-customer.model';

interface BondsRes {
    success: boolean;
    data?: any;
    message?: string;
}

@Injectable()
export class CustomersSeederService {
    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
        private utilityService: UtilityService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    icmPartnerId = 'icmAdvisory';
    bondsApiUrl = this.configService.get<string>('ICM_API_URL');

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    async getAccessToken(params: {
        name: string;
        email: string;
        phone_number: string;
    }): Promise<BondsRes> {
        try {
            const bondsUrl = new URL('/generateicmAdvjwt', this.bondsApiUrl);
            bondsUrl.searchParams.set('name', params.name);
            bondsUrl.searchParams.set('email', params.email);
            bondsUrl.searchParams.set('phone', `${params.phone_number}`);
            bondsUrl.searchParams.set('cCode', encodeURI('+91'));
            bondsUrl.searchParams.set('phoneVerified', 'true');
            bondsUrl.searchParams.set('partner', 'icmAdvisory');
            bondsUrl.searchParams.set('subPartner', 'ICMP001');

            return this.httpService.axiosRef.get(bondsUrl.href).then((res) => res.data);
        } catch (error) {
            console.log('🚀 ~ BondsService ~ getAccessToken ~ error:', error);
        }
    }

    async refreshToken(api_token: string): Promise<BondsRes> {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.bondsApiUrl}/partners/icmAdvisory`,
                params: {
                    verify_token: api_token,
                    pid: '40',
                    source: 'icmAdvisory',
                },
                headers: {
                    'x-product': 'orobonds:default',
                    'x-partner': this.icmPartnerId,
                },
            });
        } catch (error) {
            console.log('🚀 ~ CustomersSeederService ~ refreshToken ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not refresh access token.',
            );
        }
    }

    async seedCustomer(lead: any): Promise<Customer> {
        if (!lead.phone) return Promise.resolve(null);
        if (!lead.name) return Promise.resolve(null);

        if (!lead.advisorId) {
            console.log(
                '🚀 ~ file: customers.seeder.service.ts:57 ~ CustomersSeederService ~ .then ~ lead:',
                lead,
            );
        }

        return await this.customerModel
            .findOne({ email: lead.email })
            .then(async (customer) => {
                if (customer) {
                    const uc = await this.userCustomerModel.findOne({ customer_id: customer.id });

                    if (!uc) {
                        await this.userCustomerModel.create({
                            customer_id: customer.id,
                            user_id: lead.advisorId,
                            account_id: lead.accountId,
                        });
                    }
                    return Promise.resolve(null);
                }

                const res = await this.getAccessToken({
                    name: lead.name,
                    email: lead.email,
                    phone_number: lead.phone,
                });

                const newCustomer = await this.customerModel.create({
                    name: lead.name,
                    email: lead.email,
                    phone_number: lead.phone,
                    connections: [
                        {
                            token: res.data.jwt,
                            foreign_id: lead.userId,
                        },
                    ],
                    is_phone_verified: lead.phoneVerified,
                    tags: ['Seeded', 'InCred Money'],
                });

                return Promise.resolve(
                    await this.userCustomerModel.create({
                        customer_id: newCustomer.id,
                        user_id: lead.advisorId,
                        account_id: lead.accountId,
                    }),
                );
            })
            .catch((error) => Promise.reject(error));
    }

    /**
     * Seed all customers.
     *
     * @function
     */
    async seedCustomers(): Promise<any> {
        console.log(
            '🚀 ~ file: customers.seeder.service.ts:104 ~ CustomersSeederService ~ leads.map ~ leads:',
            leads.length,
        );
        return await Promise.all(
            leads.map(async (lead: any) => {
                return this.seedCustomer(lead);
            }),
        ).then((result) => {
            const customers = result.filter((customer) => customer);
            console.log(
                '🚀 ~ CustomersSeederService ~ seedCustomers ~ result:',
                customers,
                customers.length,
            );
        });
    }

    async syncCustomers() {
        const customers = await this.customerModel.find({});

        return await Promise.all(
            customers.map(async (customer) => {
                const getRefreshToken = await this.refreshToken(
                    customer.getConnectionValue(ConnectionType.ICM, 'refresh_token'),
                );

                if (!getRefreshToken.success) return;

                customer.setConnectionValue(
                    ConnectionType.ICM,
                    'access_token',
                    getRefreshToken.data.token,
                );
                customer.setConnectionValue(
                    ConnectionType.ICM,
                    'access_token_expires_at',
                    new Date(Number(getRefreshToken.data.tokenExpiry)),
                );
                return customer.save();
            }),
        );
    }
}
