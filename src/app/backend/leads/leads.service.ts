import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from 'src/models/lead.model';
import { CreateLeadReqDto } from './dto/request/create-lead.req.dto';
import { SessionUser } from 'src/constants/user.const';
import { Customer, CustomerDocument } from 'src/models/customer.model';
import { ConfigService } from '@nestjs/config';
import MailerService from 'src/services/mailer.service';
import { ResProps } from 'src/constants/constants';
import GetLeadsReqDto from './dto/request/get-leads.req.dto';
import BondsService from 'src/services/bonds.service';
import * as bcrypt from 'bcrypt';
import Msg91Service from 'src/services/msg91.service';
import { VerifyOtpReqDto } from './dto/request/verify-otp.req.dto';
import { LeadStatus } from 'src/constants/lead.const';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadCreateEvent } from './events/lead-create.event';
import { AccessControlList } from 'src/constants/access-control.const';
import UtilityService from 'src/services/utility.service';

@Injectable()
export class LeadsService {
    constructor(
        @InjectModel(Lead.name)
        private leadModel: Model<LeadDocument>,
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        private configService: ConfigService,
        private mailerService: MailerService,
        private bondsService: BondsService,
        private msg91Service: Msg91Service,
        private eventEmitter: EventEmitter2,
        private utilityService: UtilityService,
    ) {}

    baseUrl = this.configService.get<string>('ICM_API_URL');

    // Function to create a Unique id by merging date and a random digit to be used as slug
    generateUniqueId = () => {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substring(2, 8);
        return `${timestamp}${random}`;
    };

    async getOneTimePassword(): Promise<{ token: string; secret: string }> {
        const token = Math.random().toString().substring(4, 8);
        const secret = await bcrypt.hash(token, 10);

        console.log('🚀 ~ LeadsService ~ getOneTimePassword:', token, secret);
        return { token, secret };
    }

    async createLead(session: SessionUser, body: CreateLeadReqDto): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: body.customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const lead = await this.leadModel.create({
            customer_id: customer.id,
            user_id: session.user_id,
            account_id: session.account_id,
            name: customer.name,
            email: customer.email,
            phone_code: customer.phone_code,
            phone_number: customer.phone_number,
            product_isin: body.product_isin,
            product_units: body.product_units,
            product_xirr: body.product_xirr,
            slug: this.generateUniqueId(),
        });

        this.eventEmitter.emit('lead.create', new LeadCreateEvent(lead.toJSON()));

        return {
            success: true,
            message: `Product interest email sent to ${customer.email}.`,
        };
    }

    async getLeads(session: SessionUser, query: GetLeadsReqDto): Promise<ResProps> {
        const queryParams = {};

        const accessControlList = [
            AccessControlList.LIST_LEADS,
            AccessControlList.LIST_ACCOUNT_LEADS,
            AccessControlList.LIST_MANAGED_LEADS,
            AccessControlList.LIST_USER_LEADS,
        ];

        if (!this.utilityService.arrayIncludes(accessControlList, session.roles)) {
            return {
                success: false,
                message: 'You do not have access to this resource.',
            };
        }

        if (
            session.roles.includes(AccessControlList.LIST_ACCOUNT_LEADS) ||
            session.roles.includes(AccessControlList.LIST_MANAGED_LEADS) // TODO: Change this for hierarchy.
        ) {
            queryParams['account_id'] = session.account_id;
        } else if (session.roles.includes(AccessControlList.LIST_USER_LEADS)) {
            queryParams['account_id'] = session.account_id;
            queryParams['user_id'] = session.user_id;
        }

        if (query.status) {
            queryParams['status'] = query.status;
        }

        const [leads] = await this.leadModel.aggregate([
            { $match: { ...queryParams } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    collection: [
                        { $sort: { created_at: -1 } },
                        { $skip: (query.page - 1) * query.per_page },
                        { $limit: query.per_page },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                slug: 1,
                                status: 1,
                                type: 1,
                                name: 1,
                                email: 1,
                                phone_code: 1,
                                phone_number: 1,
                                product_isin: 1,
                                product_units: 1,
                                product_xirr: 1,
                                customer_id: 1,
                                user_id: 1,
                                account_id: 1,
                                created_at: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    collection: 1,
                    total_count: { $first: '$total.count' },
                },
            },
        ]);

        return {
            success: true,
            data: {
                ...leads,
                page: query.page,
                per_page: query.per_page,
            },
        };
    }

    async getLead(lead_id: string): Promise<ResProps> {
        const lead = await this.leadModel.findOne({ _id: lead_id });

        if (!lead) {
            return {
                success: false,
                message: 'Lead not found',
            };
        }

        // const access = await this.bondsService.refreshToken(customer);
        // const resGetLeadInvestment = await this.bondsService.getLeadInvestment(lead);
        const resGetProduct = await this.bondsService.getProduct(lead.product_isin);

        return {
            success: true,
            data: {
                ...lead.toJSON(),
                product: resGetProduct.data,
            },
        };
    }

    async resendOtp(lead_id: string): Promise<ResProps> {
        const lead = await this.leadModel.findOne({ _id: lead_id });

        if (!lead) {
            return {
                success: false,
                message: 'Lead not found.',
            };
        }

        const { token, secret } = await this.getOneTimePassword();
        await this.msg91Service.sendMessage(`${lead.phone_code}${lead.phone_number}`, token);

        lead.set('phone_secret', secret);
        await lead.save();

        return {
            success: true,
            message: `OTP sent to ${lead.phone_code}${lead.phone_number}.`,
        };
    }

    async verifyOtp(lead_id: string, body: VerifyOtpReqDto): Promise<ResProps> {
        const lead = await this.leadModel.findOne({ _id: lead_id });

        if (!lead) {
            return {
                success: false,
                message: 'Lead not found.',
            };
        }

        const isMatch = await bcrypt.compare(body.phone_otp, lead.phone_secret);

        if (!isMatch) {
            return {
                success: false,
                message: 'OTP is incorrect.',
            };
        }

        lead.set('is_phone_verified', true);
        lead.set('status', LeadStatus.INTERESTED);
        await lead.save();

        return {
            success: true,
            message: 'OTP verified successfully.',
        };
    }
}
