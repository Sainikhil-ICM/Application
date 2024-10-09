import * as fs from 'fs';
import * as util from 'util';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { ResProps1 } from 'types';
import { eachSeries } from 'async';
import { Readable } from 'stream';
import { startCase } from 'lodash';
import { v4 as uuid } from 'uuid';
import { rimrafSync } from 'rimraf';
import { exec } from 'child_process';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Model, ObjectId, Schema, Types } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {
    Customer,
    CustomerDocument,
    CustomerStatics,
    ConnectionType,
    Connection,
} from 'src/models/customer.model';
import { User, UserDocument } from 'src/models/user.model';
import { Account, AccountDocument } from 'src/models/account.model';
import { UserLink, UserLinkDocument } from 'src/models/user-link.model';
import { UserCustomer, UserCustomerDocument } from 'src/models/user-customer.model';
import { CustomerProfile, CustomerProfileDocument } from 'src/models/customer-profile.model';

import {
    AkycCustomerRejectKycDto,
    AkycDigilockerRequestDto,
    AkycGetCustomerProfileQueryDto,
    AkycSubmitCustomerProfileDto,
    AkycValidateSelfieDto,
    AkycVerifyPanDto,
} from './dto/akyc.dto';
import {
    OnboardingFormImagesDto,
    IndividualOnboardingFormDto,
} from 'src/services/digio/dto/individual-onboarding-form.dto';
import { SendConsentDto } from './dto/send-consent.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CheckLocationDto } from './dto/check-location.dto';
import { ValidatePanDto } from './dto/validate-pan.dto';
import { InviteCustomerDto } from './dto/invite-customer.dto';
import { UpdateCustomerDto } from './dto/upadte-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { WhatsappConsentDto } from './dto/whatsapp-consent.dto';
import { GetDematDetailsDto } from './dto/get-demat-details.dto';
import { SubmitSignedFormDto } from './dto/submit-signed-form.dto';
import { GetVerificationOtp } from './dto/get-verification-otp.dto';
import { AcceptRejectKYCDto } from './dto/accept-reject-kyc.req.dto';
import { ThirdPartyCustomerDto } from './dto/third-party-customer.dto';
import { VerificationTokenDto } from './dto/get-verification-token.dto';
import { SubmitOnboardingKycDto } from './dto/submit-onboarding-kyc.dto';
import { VerifyCustomerConsentDto } from './dto/verify-customer-consent.dto';
import { SubmitFullKycDataDto } from 'src/services/hyper-verge/dto/bonds-hyper-verge.dto';
import { NonIndividualOnboardingFormDto } from 'src/services/digio/dto/non-individual-onboarding-form.dto';

import {
    AddressProofType,
    AkycErrorPanValidation,
    B2CCustomerAttachmentMap,
    CustomerProfileStatus,
    CustomerProfileType,
    CustomerKycStatus,
    Gender,
    KycMode,
    ValidationType,
} from 'src/constants/customer.const';
import { ResProps } from 'src/constants/constants';
import { SessionUser } from 'src/constants/user.const';
import { OrderStatus } from 'src/constants/payment.const';
import { AccessControlList } from 'src/constants/access-control.const';
import { AttachmentType, FileType } from 'src/constants/attachment.const';
import { PRODUCTS_LISTING_KYC_ACCESS_MAP, ProductType } from 'src/constants/product.const';

import { CustomersRepository } from './customers.repository';
import { UsersRepository } from '../users/users.repository';

import { AkycSubmitEvent } from '../users/events/customer-akyc-submit.event';
import { CustomerUccCreationEvent } from '../payments/events/customer-ucc.event';
import { CustomerOkycSubmitEvent } from '../payments/events/customer-okyc-submit.event';
import { CustomerAkycRejectEvent } from '../payments/events/customer-reject-akyc.event';

import UtilityService from 'src/services/utility.service';
import MailerService from 'src/services/mailer.service';
import BondsService from 'src/services/bonds.service';
import Msg91Service from 'src/services/msg91.service';
import UploadService from 'src/services/upload.service';
import ZohoService from 'src/services/zoho/zoho.service';
import DigioService from 'src/services/digio/digio.service';
import AttachmentService from 'src/services/attachment.service';
import OnboardingService from 'src/services/onboarding/onboarding.service';
import ListedBondService from 'src/services/listed-bond/listed-bond.service';
import HyperVergeService from 'src/services/hyper-verge/hyper-verge.service';
import MutualFundService from 'src/services/mutual-fund/mutual-fund.service';
import BondsHyperVergeService from 'src/services/hyper-verge/bonds-hyper-verge.service';
import UnlistedEquityService from 'src/services/unlisted-equity/unlisted-equity.service';
import { GetPanDetailsDto } from 'src/services/onboarding/dmo/get-pan-details.dto';
import { CreateCustomerDmo } from 'src/services/onboarding/dmo/create-customer.dmo';
import { BrandName } from 'src/constants/mailer.const';
import { UpdateCustomerDmo } from 'src/services/onboarding/dmo/update-customer.dmo';
import {
    CvlDataTransformToProfile,
    CvlDataTransformToCustomer,
} from './dmo/cvl-data-transform.dmo';
import { CvlKycDataResponse, IcmThirdPartyData } from 'src/constants/onboarding.const';
import {
    IcmThirdPartyDataTransformToCustomer,
    IcmThirdPartyDataTransformToProfile,
} from './dmo/icm-tpd-transform.dmo';

const execPromise = util.promisify(exec);

@Injectable()
export class CustomersService {
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument> & CustomerStatics,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(UserCustomer.name)
        private readonly userCustomerModel: Model<UserCustomerDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
        @InjectModel(UserLink.name)
        private readonly userLinkModel: Model<UserLinkDocument>,

        // @Inject('CUSTOMER_SERVICE')
        // private readonly customerService: ClientProxy,

        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
        private readonly bondsService: BondsService,
        private readonly msg91Service: Msg91Service,
        private readonly utilityService: UtilityService,
        private readonly uploadService: UploadService,
        private readonly eventEmitter: EventEmitter2,
        private readonly zohoService: ZohoService,
        private readonly customerRepository: CustomersRepository,
        private readonly usersRepository: UsersRepository,
        private readonly attachmentService: AttachmentService,
        private readonly unlistedEquityService: UnlistedEquityService,
        private readonly bondsHyperVergeService: BondsHyperVergeService,
        private readonly mutualFundService: MutualFundService,
        private readonly hyperVergeService: HyperVergeService,
        private readonly jwtService: JwtService,
        private readonly customersRepository: CustomersRepository,
        private readonly digioService: DigioService,
        private readonly onboardingService: OnboardingService,
    ) {}

    private async getReporteeIds(
        managerIds: string[],
        memo: string[] = [],
        retries = 5,
    ): Promise<string[]> {
        const userIds = [...new Set([...memo, ...managerIds])];
        const reporteeIds = await this.userLinkModel
            .distinct('reportee_id', { manager_id: { $in: managerIds } })
            .then((ids) => ids.map((id) => String(id)));

        // Adding retries to avoid infinite loop.
        if (reporteeIds.length && retries > 0) {
            return await this.getReporteeIds(reporteeIds, userIds, retries - 1);
        }

        return userIds;
    }

    private async streamToBuffer(stream: Readable): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];

            stream.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
            });

            stream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(buffer);
            });

            stream.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    async createCustomer(
        session: SessionUser,
        createCustomerDto: CreateCustomerDto,
    ): Promise<ResProps> {
        const account = await this.accountModel
            .findOne({ _id: session.account_id })
            .select('id code');

        debugger;

        const resCreateCustomerIcm = await this.onboardingService
            // Creating customer in ICM B2C.
            .createCustomer(
                new CreateCustomerDmo({
                    ...createCustomerDto,
                    account_code: account.code,
                    connection_type: ConnectionType.ICM,
                }),
            );

        if (!resCreateCustomerIcm.success)
            return {
                success: false,
                message: resCreateCustomerIcm.message,
            };

        const resCreateCustomerBidd = await this.onboardingService
            // Creating customer in ICM B2C.
            .createCustomer(
                new CreateCustomerDmo({
                    ...createCustomerDto,
                    account_code: account.code,
                    connection_type: ConnectionType.BIDD,
                }),
            );

        if (!resCreateCustomerBidd.success) {
            return {
                success: false,
                message: resCreateCustomerBidd.message,
            };
        }

        const existingCustomerByIcm = await this.customerModel.getCustomerByForeignId(
            ConnectionType.ICM,
            resCreateCustomerIcm.data.foreign_id,
        );
        const existingCustomerByBidd = await this.customerModel.getCustomerByForeignId(
            ConnectionType.BIDD,
            resCreateCustomerBidd.data.foreign_id,
        );

        let customer: CustomerDocument | undefined | null =
            existingCustomerByIcm || existingCustomerByBidd;

        if (!customer) {
            // create customer and set the connection values
            const customerParams = { ...createCustomerDto };

            const { address, city, state, pincode, country, address_type, pan_number } =
                customerParams;
            const { account_type, account_number, ifsc_code } = customerParams;

            const existingCustomerByPan = await this.customerRepository.findCustomer({
                pan_number,
            });
            let newCustomer: CustomerDocument;
            if (existingCustomerByPan) {
                newCustomer = existingCustomerByPan;
            } else {
                // customerParams['advisor_id'] = session.user_id;
                // customerParams['account_id'] = session.account_id;
                newCustomer = (await this.customerModel.create({
                    ...customerParams,
                })) as CustomerDocument;

                await newCustomer.save();
            }

            await this.customerRepository.createCustomerProfile(newCustomer._id, {
                customer_id: newCustomer.id,
                name: newCustomer.name,
                email: newCustomer.email,
                phone_number: newCustomer.phone_number,
                pan_number: customerParams.pan_number,
                bank_account: {
                    type: account_type,
                    number: account_number,
                    ifsc_code: ifsc_code,
                },
                correspondance_address: {
                    line_1: address,
                    line_2: '',
                    line_3: '',
                    pin_code: pincode,
                    city,
                    state,
                    country,
                    address_type: address_type,
                    type: '',
                    document: '',
                    pan_document: '',
                    photo: '',
                },
                transaction_id: '',
            });

            // save icm connection values
            for (const attributes of [
                { connectionField: 'access_token', customerField: 'access_token' },
                { connectionField: 'refresh_token', customerField: 'api_token' },
                {
                    connectionField: 'access_token_expires_at',
                    customerField: 'access_token_expires_at',
                },
                { connectionField: 'foreign_id', customerField: 'foreign_id' },
            ])
                newCustomer.setConnectionValue(
                    ConnectionType.ICM,
                    attributes.connectionField as keyof Connection,
                    resCreateCustomerIcm.data[attributes.customerField],
                );

            // save bidd connection values
            for (const attributes of [
                { connectionField: 'access_token', customerField: 'access_token' },
                { connectionField: 'refresh_token', customerField: 'api_token' },
                {
                    connectionField: 'access_token_expires_at',
                    customerField: 'access_token_expires_at',
                },
                { connectionField: 'foreign_id', customerField: 'foreign_id' },
            ])
                newCustomer.setConnectionValue(
                    ConnectionType.BIDD,
                    attributes.connectionField as keyof Connection,
                    resCreateCustomerBidd.data[attributes.customerField],
                );

            await newCustomer.save();
            customer = newCustomer;
        } else if (existingCustomerByIcm && existingCustomerByBidd) {
            // assertion:
            if (existingCustomerByBidd.id.toString() !== existingCustomerByIcm.id.toString()) {
                // system fault!
                // these shouldn't be two different customer documents
                console.error(
                    `Create customer ~ Duplicate customer documents ${existingCustomerByBidd.id} & ${existingCustomerByIcm.id}`,
                );

                return {
                    success: false,
                    error: `Fatal error: duplicate `,
                };
            }
        } else if (existingCustomerByBidd) {
            // save icm connection values
            for (const attributes of [
                { connectionField: 'access_token', customerField: 'access_token' },
                { connectionField: 'refresh_token', customerField: 'api_token' },
                {
                    connectionField: 'access_token_expires_at',
                    customerField: 'access_token_expires_at',
                },
                { connectionField: 'foreign_id', customerField: 'foreign_id' },
            ])
                existingCustomerByBidd.setConnectionValue(
                    ConnectionType.ICM,
                    attributes.connectionField as keyof Connection,
                    resCreateCustomerIcm.data[attributes.customerField],
                );
            await existingCustomerByBidd.save();
        } else if (existingCustomerByIcm) {
            // save bidd connection values
            for (const attributes of [
                { connectionField: 'access_token', customerField: 'access_token' },
                { connectionField: 'refresh_token', customerField: 'api_token' },
                {
                    connectionField: 'access_token_expires_at',
                    customerField: 'access_token_expires_at',
                },
                { connectionField: 'foreign_id', customerField: 'foreign_id' },
            ])
                existingCustomerByIcm.setConnectionValue(
                    ConnectionType.BIDD,
                    attributes.connectionField as keyof Connection,
                    resCreateCustomerBidd.data[attributes.customerField],
                );
            await existingCustomerByIcm.save();
        }

        // check if the user customer link exists
        // create if it doesn't exist
        const userCustomerParams = {};
        userCustomerParams['customer_id'] = customer.id;
        userCustomerParams['user_id'] = session.user_id;
        userCustomerParams['account_id'] = session.account_id;

        if (
            !resCreateCustomerIcm.data.is_existing_customer &&
            !resCreateCustomerBidd.data.is_existing_customer
        ) {
            userCustomerParams['is_first_contact'] = true;
        }

        // Linking customer to the advisor.
        await this.userCustomerModel.findOneAndUpdate(
            { ...userCustomerParams },
            { ...userCustomerParams },
            { upsert: true },
        );

        // Update customer third party data.
        const connectionBidd = customer.getConnection(ConnectionType.BIDD);

        if (connectionBidd) {
            await this.onboardingService
                // Updating customer details in BIDD.
                .updateCustomer(
                    new UpdateCustomerDmo({
                        ...customer.toJSON(),
                        connection_type: connectionBidd.type,
                        access_token: connectionBidd.access_token,
                    }),
                );
        }

        const connectionIcm = customer.getConnection(ConnectionType.ICM);

        if (connectionIcm) {
            await this.onboardingService
                // Updating customer details in ICM.
                .updateCustomer(
                    new UpdateCustomerDmo({
                        ...customer.toJSON(),
                        connection_type: connectionIcm.type,
                        access_token: connectionIcm.access_token,
                    }),
                );
        }

        // if (!resUpdateCustomerIcm.success || !resUpdateCustomerBidd.success) {
        //     // Sync TPD data for KYC Verified customer.
        //     const syncData = await this.syncCustomer(customer.id, session);
        //     customer.status = syncData.data.status;
        //     return {
        //         success: true,
        //         message: 'Customer added successfully.',
        //         data: customer,
        //     };
        // }

        if (createCustomerDto.product_type === ProductType.IPO) {
            // Generating customer id for mini KYC.
            const resGenerateCustIdIcm = await this.onboardingService.generateCustId(
                customer.getConnection(ConnectionType.ICM),
            );
            const resGenerateCustIdBidd = await this.onboardingService.generateCustId(
                customer.getConnection(ConnectionType.BIDD),
            );
            console.log(
                '🚀 ~ CustomersService ~ createCustomer ~ resGenerateCustIdIcm:',
                resGenerateCustIdIcm,
            );
            console.log(
                '🚀 ~ CustomersService ~ createCustomer ~ resGenerateCustIdBidd:',
                resGenerateCustIdBidd,
            );
        }

        // Pull data from ICM & CVL
        await this.fetchCustomerData(customer);

        return {
            success: true,
            data: customer,
            message: 'Customer added successfully.',
        };
    }

    /**
     * Fetches KYC data of the customer from ICM & CVL databases
     *
     * @param customer The customer for which we have to pull data from external sources
     */
    async fetchCustomerData(customer: CustomerDocument) {
        // first try to pull from CVL
        const connection = customer.getConnection(ConnectionType.BIDD);
        console.log(connection);
        const cvlDataResponse = await this.onboardingService.getCustomerCvlData(
            connection,
            customer.pan_number,
            customer.birth_date,
        );

        let customerProfileUpdates: any = {};
        let customerUpdates: any = {};

        if (cvlDataResponse.success) {
            customerProfileUpdates = cvlDataResponse.data.customerProfileUpdates;
            customerUpdates = cvlDataResponse.data.customerUpdates;
        } else {
            // If KYC is not valid, pull any data present in ICM
            const customerDataFromIcm = await this.onboardingService.getCustomer(
                customer.getConnection(ConnectionType.ICM),
            );

            const icmCustomerData = customerDataFromIcm.data as IcmThirdPartyData;
            customerUpdates = new IcmThirdPartyDataTransformToCustomer(icmCustomerData);
            customerProfileUpdates = new IcmThirdPartyDataTransformToProfile(icmCustomerData);
        }

        const customerProfile = await this.customerRepository.getCustomerProfile(customer.id);

        for (const key of Object.keys(customerProfileUpdates)) {
            if (customerProfileUpdates[key]) {
                customerProfile[key] = customerProfileUpdates[key];
            }
        }
        await customerProfile.save();

        for (const key of Object.keys(customerUpdates)) {
            if (customerUpdates[key]) {
                customer[key] = customerUpdates[key];
            }
        }
        await customer.save();
    }

    async sendCustomerConsent(params: SendConsentDto) {
        const clientUrl = this.configService.get<string>('CLIENT_URL');
        const actionUrl = new URL(
            `${clientUrl}/consent/customers/${params.customer_id}/onboarding`,
        );

        const customer = await this.customerModel.findOne({ _id: params.customer_id }).exec();
        customer.is_consent_given = false;

        customer.setConnectionValue(
            ConnectionType.ICM,
            'kyc_status',
            CustomerKycStatus.KYC_INITIATED,
        );

        customer.kyc_mode = KycMode.MIN_KYC;
        await customer.save();

        console.log(
            '🚀 ~ file: customers.service.ts:79 ~ CustomersService ~ sendCustomerConsent ~ customer:',
            customer,
        );

        const incomeCategoryMap = {
            LT_1_LAKH: '1',
            '1_5_LAKH': '2',
            '5_10_LAKH': '3',
            '10_25_LAKH': '4',
            GT_25_LAKH: '5',
        };

        await this.bondsService.updateThirdPartyData(
            customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
            {
                name: customer.name,
                pan: customer.pan_number,
                gender: customer.gender == Gender.MALE ? 'M' : 'F',
                income: incomeCategoryMap[customer.income],
                dob: customer.birth_date,
                demat: customer.demat_number,
                accountNumber: customer.account_number,
                ifscCode: customer.ifsc_code,
                addressDocType: 'address',
                addressDetails: {
                    address: customer.address,
                    state: customer.state,
                    districtOrCity: customer.city,
                    pincode: customer.pincode,
                    localityOrPostOffice: customer.locality,
                    country: 'India',
                },
            } as ThirdPartyCustomerDto,
        );

        this.mailerService.sendTemplateEmail({
            template_name: 'send-consent.hbs',
            template_params: { ...params, action_url: actionUrl.href },
            subject: 'InCred Money | Consent for Onboarding',
            to_emails: [customer.email],
        });

        return {
            success: true,
            message: 'Consent link has been sent to the customer.',
        };
    }

    async getCustomers(
        session: SessionUser,
        getCustomersDto: GetCustomersDto,
    ): Promise<ResProps1<any>> {
        const queryParams = {};
        const accessControlList = [
            AccessControlList.LIST_CUSTOMERS,
            AccessControlList.LIST_ACCOUNT_CUSTOMERS,
            AccessControlList.LIST_MANAGED_CUSTOMERS,
            AccessControlList.LIST_USER_CUSTOMERS,
        ];

        if (!this.utilityService.arrayIncludes(accessControlList, session.roles)) {
            return {
                success: false,
                message: 'You do not have access to this resource.',
            };
        }

        if (session.roles.includes(AccessControlList.LIST_ACCOUNT_CUSTOMERS)) {
            queryParams['account_id'] = session.account_id;
        } else if (session.roles.includes(AccessControlList.LIST_MANAGED_CUSTOMERS)) {
            queryParams['account_id'] = session.account_id;

            const reporteeIds = await this
                // Commenting helps keep this code in multiple lines.
                .getReporteeIds([String(session.user_id)])
                .then((ids) => ids.map((id) => new Types.ObjectId(id)));

            queryParams['user_id'] = { $in: reporteeIds };
        } else if (session.roles.includes(AccessControlList.LIST_USER_CUSTOMERS)) {
            queryParams['account_id'] = session.account_id;
            queryParams['user_id'] = session.user_id;
        }

        const allowedKycModes =
            PRODUCTS_LISTING_KYC_ACCESS_MAP[getCustomersDto.product_listing_status];

        const searchParams: any = { pan_number: { $exists: true } };

        if (getCustomersDto.name) {
            searchParams['name'] = { $regex: new RegExp(getCustomersDto.name, 'i') };
        }

        if (getCustomersDto.pan_number) {
            searchParams['pan_number'] = getCustomersDto.pan_number;
        }

        if (getCustomersDto.status) {
            if (getCustomersDto.status === 'PENDING') {
                searchParams['connections.kyc_status'] = { $ne: CustomerKycStatus.KYC_VERIFIED };
            } else {
                searchParams['connections.kyc_status'] = getCustomersDto.status;
            }
        }

        if (getCustomersDto.product_listing_status) {
            searchParams['kyc_mode'] = { $in: allowedKycModes };
        }

        const [customers] = await this.customersRepository
            // Commenting helps keep this code in multiple lines.
            .getCustomers(queryParams, searchParams, getCustomersDto);

        // const resCreateRecord = await this.zohoService.createRecord({
        //     recordType: 'Contacts',
        //     data: new CreateCustomerDto({ name: 'test' }),
        // });

        return {
            success: true,
            data: {
                ...customers,
                page: getCustomersDto.page,
                per_page: getCustomersDto.per_page,
            },
        };
    }

    async getCustomersInLastHours(user_id: ObjectId, hours: number): Promise<ResProps> {
        const queryParams = {};

        if (hours !== -1) {
            const now = new Date();
            const hoursAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);
            queryParams['created_at'] = { $gte: hoursAgo };
        }

        const customers = await this.userCustomerModel
            .find(queryParams)
            .sort({ created_at: 'desc' })
            .populate({ path: 'customer' })
            .populate({ path: 'account', select: 'code' })
            .populate({ path: 'advisor', select: 'name' });

        return { success: true, data: customers };
    }

    async getCustomerMandateStatus(customer_id: string): Promise<ResProps> {
        const customer = (await this.customerModel.findOne({
            _id: customer_id,
        })) as CustomerDocument;

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        if (!customer.mandate_id) {
            return {
                success: false,
                message: 'Customer has not done mandate registration.',
            };
        }

        if (customer.is_mandate_approved) {
            return {
                success: true,
                message: 'Customer e-mandate has been approved',
            };
        }

        const mandateResponse = await this.mutualFundService.getMandateStatus(customer.mandate_id, {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        });

        console.log('🚀 ~ file: CustomerService ~ mandateResponse:', mandateResponse);

        if (!mandateResponse.success || mandateResponse?.result?.status !== 'APPROVED') {
            return {
                success: false,
                message: 'Customer e-mandate has not been approved yet',
            };
        }
        if (mandateResponse.result.status === 'APPROVED') {
            customer['is_mandate_approved'] = true;
            customer.save();
        }
        return {
            success: true,
            message: 'Customer e-mandate has been approved',
        };
    }

    async getCustomer(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });
        const attachments = await this.attachmentService.getCustomerAttachments(customer_id);

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        return {
            success: true,
            data: { ...customer.toJSON(), attachments },
        };
    }

    async validateCustomerKyc(): Promise<ResProps> {
        return {
            success: true,
            message: 'Customer is valid for KYC',
        };
    }

    async updateCustomer(customer_id: string, params: UpdateCustomerDto) {
        const {
            address,
            city,
            state,
            pincode,
            country,
            account_number,
            ifsc_code,
            address_type,
            income,
            residential_status,
        } = params;

        const data = await this.customerModel.updateOne({ _id: customer_id }, params);

        const customerProfile = await this.customerRepository.getCustomerProfile(customer_id);

        const existingData: any = { bank_account: {}, correspondance_address: {} };
        if (customerProfile) {
            existingData.bank_account = {
                ...customerProfile.bank_account,
            };
            existingData.correspondance_address = {
                ...customerProfile.correspondance_address,
            };
        }

        await this.customerRepository.createCustomerProfile(new Types.ObjectId(customer_id), {
            bank_account: {
                number: account_number || existingData.bank_account.number,
                ifsc_code: ifsc_code || existingData.bank_account.ifsc_code,
            },
            correspondance_address: {
                line_1: address || existingData.correspondance_address.line_1,
                line_2: '' || existingData.correspondance_address.line_2,
                line_3: '' || existingData.correspondance_address.line_3,
                pin_code: pincode || existingData.correspondance_address.pin_code,
                city: city || existingData.correspondance_address.city,
                state: state || existingData.correspondance_address.state,
                country: country || existingData.correspondance_address.country,
                address_type: address_type || existingData.correspondance_address.address_type,
                type: '' || existingData.correspondance_address.type,
                document: '' || existingData.correspondance_address.document,
                pan_document: '' || existingData.correspondance_address.pan_document,
                photo: '' || existingData.correspondance_address.photo,
            },
            income_range: income,
            residential_status,
        });

        if (data.modifiedCount === 0) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        return {
            success: true,
            message: 'Customer updated successfully.',
        };
    }

    async syncCustomerDocs(customer: CustomerDocument, session: SessionUser) {
        const resGetCustomerDocs = await this.bondsService.getCustomerDocs(customer.pan_number);
        console.log(
            '🚀 ~ CustomersService ~ syncCustomer ~ resGetCustomerDocs:',
            resGetCustomerDocs,
        );

        if (resGetCustomerDocs.success && resGetCustomerDocs.data?.length) {
            resGetCustomerDocs.data.map(async (doc) => {
                if (!Object.values(AttachmentType).includes(doc.type)) {
                    return;
                }

                const fileStream = await this.bondsService.downloadCustomerDocsB2C(
                    doc.data,
                    doc.email,
                );

                const buffer = await this.streamToBuffer(fileStream.stream);
                const fileSizeInBytes = buffer.length;

                const file: FileType = {
                    originalname: doc.data.substring(doc.data.indexOf('.com-') + 5) as string,
                    mimetype: fileStream.mimeType,
                    buffer: buffer,
                    size: String((fileSizeInBytes / 1024).toFixed(1)),
                    fieldname: doc.type,
                };

                const upload = await this.attachmentService.createCustomerAttachment(file, {
                    customer_id: customer.id,
                    account_id: session.account_id,
                    user_id: session.user_id,
                });

                console.log('🚀 ~ CustomersService ~ createCustomerAttachmentB2C ~ upload', upload);
            });
        }
    }

    async syncCustomerOld(customer_id: string, session: SessionUser) {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        debugger;
        // Emitting event to create customer microservice.
        // this.customerService.emit('CREATE_CUSTOMER', new CreateCustomerEvent(customer.toJSON()));

        debugger;
        if (!customer) {
            return {
                success: false,
                message: 'Could not sync customer.',
            };
        }

        const resGetCustomerIcm = await this.onboardingService.getCustomer(
            customer.getConnection(ConnectionType.ICM),
        );

        const genderMap = {
            F: 'FEMALE',
            M: 'MALE',
            O: 'OTHER',
        };

        // Syncing customer documents.
        await this.syncCustomerDocs(customer, session);

        if (resGetCustomerIcm.success && resGetCustomerIcm.data.status) {
            customer['name'] = resGetCustomerIcm.data.name;
            if (resGetCustomerIcm.data.status === 'approved') {
                customer.setConnectionValue(
                    ConnectionType.ICM,
                    'kyc_status',
                    CustomerKycStatus.KYC_VERIFIED,
                );
            }
            customer['gender'] = genderMap[resGetCustomerIcm.data.gender];
            customer['birth_date'] = resGetCustomerIcm.data.dob || customer.birth_date;
            customer['demat_number'] = resGetCustomerIcm.data.demat;
            customer['address'] = resGetCustomerIcm.data.addressDetails?.address;
            customer['state'] = resGetCustomerIcm.data.addressDetails?.state;
            customer['pincode'] = resGetCustomerIcm.data.addressDetails?.pincode;
            customer['locality'] = resGetCustomerIcm.data.addressDetails?.localityOrPostOffice;
            customer['city'] = resGetCustomerIcm.data.addressDetails?.districtOrCity;
            customer['account_number'] = resGetCustomerIcm.data.accountNumber;
            customer['ifsc_code'] = resGetCustomerIcm.data.ifscCode;
            customer['account_type'] = resGetCustomerIcm.data.accountType;
        }

        if (customer.kyc_mode !== KycMode.MIN_KYC) {
            const resGetCustomerBidd = await this.onboardingService.getCustomer(
                customer.getConnection(ConnectionType.BIDD),
            );

            if (resGetCustomerBidd.success && resGetCustomerBidd.data.status) {
                if (resGetCustomerBidd.data.status === 'approved') {
                    customer.setConnectionValue(
                        ConnectionType.BIDD,
                        'kyc_status',
                        CustomerKycStatus.KYC_VERIFIED,
                    );
                }
                customer['gender'] = genderMap[resGetCustomerBidd.data.gender] || customer.gender;
                customer['birth_date'] = resGetCustomerBidd.data.dob || customer.birth_date;
                customer['demat_number'] = resGetCustomerBidd.data.demat || customer.demat_number;
                customer['address'] =
                    resGetCustomerBidd.data.addressDetails?.address || customer.address;
                customer['state'] = resGetCustomerBidd.data.addressDetails?.state || customer.state;
                customer['pincode'] =
                    resGetCustomerBidd.data.addressDetails?.pincode || customer.pincode;
                customer['locality'] =
                    resGetCustomerBidd.data.addressDetails?.localityOrPostOffice ||
                    customer.locality;
                customer['city'] =
                    resGetCustomerBidd.data.addressDetails?.districtOrCity || customer.city;
                customer['account_number'] =
                    resGetCustomerBidd.data.accountNumber || customer.account_number;
                customer['ifsc_code'] = resGetCustomerBidd.data.ifscCode || customer.ifsc_code;
                customer['account_type'] =
                    resGetCustomerBidd.data.accountType || customer.account_type;
            }
        }

        await customer.save();

        return {
            success: true,
            message: 'Customer synced successfully.',
            data: customer,
        };
    }

    async syncCustomers(session: SessionUser) {
        const customerIds = await this.userCustomerModel.distinct('customer_id', {
            user_id: session.user_id,
        });

        const customers = await this.customerModel.find({ _id: { $in: customerIds } });

        // TODO: Move this to background job.
        return new Promise((resolve) => {
            eachSeries(
                customers,
                async (customer) => {
                    await this.syncCustomer(customer.id, session);
                    return;
                },
                (err) => {
                    console.log('🚀 ~ CustomersService ~ syncCustomers ~ err:', err);
                    resolve({
                        success: true,
                        message: 'Customers synced successfully.',
                    });
                },
            );
        });
    }

    async verifyCustomerConsentOtp(
        params: VerifyCustomerConsentDto,
        customer_id: string,
    ): Promise<ResProps> {
        try {
            const { phone_otp, email_otp, to_validate } = params;
            const customer = await this.customerModel.findOne({ _id: customer_id }).exec();

            if (!customer) {
                return {
                    success: false,
                    message: 'Customer not found.',
                };
            }

            if (customer.kyc_mode !== KycMode.MIN_KYC && !email_otp) {
                return {
                    success: false,
                    message: 'Email OTP is required.',
                };
            }

            if (
                (customer.kyc_mode === KycMode.MIN_KYC ||
                    (await bcrypt.compare(email_otp, customer.email_secret))) &&
                (await bcrypt.compare(phone_otp, customer.phone_secret))
            ) {
                if (to_validate === ValidationType.CUSTOMER_MANDATE) {
                    customer.is_mandate_consent_given = true;
                } else if (to_validate !== ValidationType.ASSISTED_KYC) {
                    customer.is_consent_given = true;
                    customer.setConnectionValue(
                        ConnectionType.ICM,
                        'kyc_status',
                        CustomerKycStatus.KYC_SUBMITTED,
                    );
                }

                await customer.save();
                return { success: true, message: 'Consent Given Successfully' };
            } else {
                throw new BadRequestException('Invalid OTP');
            }
        } catch (error) {
            console.error('🚀 ~ verifyCustomerConsentOtp ~ error:', params, customer_id, error);
            throw new Error('Failed to verify consent OTP: ' + error.message);
        }
    }

    async updateWhatsappConsent(params: WhatsappConsentDto): Promise<ResProps> {
        const { is_whatsapp_consent, customer_id } = params;
        const customer = await this.customerModel.findOne({ _id: customer_id }).exec();
        const access = await this.bondsService.refreshToken(customer);
        try {
            if (customer) {
                customer.is_whatsapp_given = is_whatsapp_consent;
                await customer.save();
                const consent = await this.bondsService.setWhatsAppConsent(
                    is_whatsapp_consent,
                    access.data.token,
                );

                if (consent.successs) {
                    return { success: true, message: 'Consent Given Successfully' };
                } else {
                    return { success: false, message: 'Consent Given Failed' };
                }
            } else {
                throw new NotFoundException('User not found.');
            }
        } catch (error) {
            console.error('🚀 ~ updateWhatsappConsent ~ error:', error, params);
            throw new Error('Failed to verify consent OTP: ' + error.message);
        }
    }

    async getOneTimePassword(): Promise<any> {
        const token = Math.random().toString().substring(4, 8);
        const secret = await bcrypt.hash(token, 10);

        console.log('🚀 ~ Login Token', token, secret);
        return { token, secret };
    }

    async sendPhoneCode(params: GetVerificationOtp): Promise<string> {
        const { phone_code, phone_number } = params;
        const { token, secret } = await this.getOneTimePassword();

        console.log('customer phone otp', token);
        await this.msg91Service
            .sendMessage(`${phone_code}${phone_number}`, token)
            .catch((error) => {
                // TODO - Send notification to dev team
                console.log('customer.service.ts: error while sending phone code', error, params);
            });

        return secret;
    }

    async sendEmailCode(email: string): Promise<string> {
        const { token, secret } = await this.getOneTimePassword();

        console.log('customer email otp', token);
        await this.mailerService.sendTemplateEmail({
            template_name: 'onetime-password.hbs',
            template_params: { token },
            subject: 'InCred Money | OTP for email verification',
            to_emails: [email],
        });

        return secret;
    }

    async resendPhoneOtp(customer_id: string): Promise<ResProps> {
        try {
            const customer = await this.customerModel.findOne({ _id: customer_id });

            if (customer) {
                const phoneSecret = await this.sendPhoneCode({
                    phone_number: customer.phone_number,
                    phone_code: customer.phone_code,
                    customer_id: customer_id,
                });

                customer.phone_secret = phoneSecret;
                await customer.save();
                return { success: true, message: 'Otp Sent' };
            } else {
                const message = `No user found`;
                throw new NotFoundException(message);
            }
        } catch (error) {
            console.error('🚀 ~ resendPhoneOtp ~ error:', error, customer_id);
            throw new Error('Failed to send OTP: ' + error.message);
        }
    }

    async resendEmailOtp(customer_id: string): Promise<ResProps> {
        try {
            const customer = await this.customerModel.findOne({ _id: customer_id }).exec();

            if (customer) {
                const emailSecret = await this.sendEmailCode(customer.email);

                customer.email_secret = emailSecret;
                await customer.save();
                return { success: true, message: 'Otp Sent' };
            } else {
                const message = `No user found`;
                throw new NotFoundException(message);
            }
        } catch (error) {
            console.error('🚀 ~ resendEmailOtp ~ error:', error, customer_id);
            throw new Error('Failed to send OTP: ' + error.message);
        }
    }

    async inviteCustomer(
        session: SessionUser,
        inviteCustomerDto: InviteCustomerDto,
    ): Promise<ResProps> {
        const account = await this.customerRepository
            // Getting the account details.
            .findAccount({ _id: session.account_id }, 'id code');

        const resCreateCustomer = await this.onboardingService
            // Creating customer in BIDD B2C for hyperverge.
            .createCustomer(
                new CreateCustomerDmo({
                    name: inviteCustomerDto.name,
                    email: inviteCustomerDto.email,
                    phone_number: inviteCustomerDto.phone_number,
                    account_code: account.code,
                    connection_type: ConnectionType.BIDD,
                }),
            );

        if (!resCreateCustomer.success) {
            return {
                success: false,
                message: resCreateCustomer.message,
            };
        }

        let customer = await this.customerRepository
            // Matching connection details with the customer.
            .findOne({
                'connections.type': ConnectionType.BIDD,
                'connections.foreign_id': resCreateCustomer.data.foreign_id,
            });

        if (customer) {
            const connection = customer.connections
                // Finding the BIDD connection details.
                .find((connection) => connection.type === ConnectionType.BIDD);

            const userCustomer = await this.customerRepository
                // Getting the user customer details.
                .findUserCustomer({ customer_id: customer.id, user_id: session.user_id });

            if (userCustomer && connection.kyc_status === CustomerKycStatus.KYC_VERIFIED) {
                return {
                    success: false,
                    message: "You've already added this customer.",
                };
            }

            if (connection.kyc_status === CustomerKycStatus.KYC_VERIFIED) {
                await this.customerRepository
                    // Linking customer to the advisor.
                    .updateUserCustomer(
                        {
                            customer_id: customer.id,
                            user_id: session.user_id,
                            account_id: session.account_id,
                        },
                        { is_first_contact: false },
                        { upsert: true },
                    );

                return {
                    success: true,
                    data: customer,
                    message: 'Customer successfully linked.',
                };
            }
        } else {
            customer = await this.customerRepository
                // Creating customer document.
                .createOne({
                    ...inviteCustomerDto,
                    connections: [
                        {
                            type: ConnectionType.BIDD,
                            access_token: resCreateCustomer.data.access_token,
                            refresh_token: resCreateCustomer.data.api_token,
                            access_token_expires_at: resCreateCustomer.data.access_token_expires_at,
                            foreign_id: resCreateCustomer.data.foreign_id,
                        },
                    ],
                });

            await this.customerRepository
                // Updating customer profile and create if not exists.
                .updateCustomerProfile(
                    { customer_id: customer.id },
                    {
                        pan_number: inviteCustomerDto.pan_number,
                        bank_account: {
                            type: inviteCustomerDto.account_type,
                            number: inviteCustomerDto.account_number,
                            ifsc_code: inviteCustomerDto.ifsc_code,
                        },
                        correspondance_address: {
                            line_1: inviteCustomerDto.address,
                            line_2: '',
                            line_3: '',
                            pin_code: inviteCustomerDto.pincode,
                            city: inviteCustomerDto.city,
                            state: inviteCustomerDto.state,
                            country: inviteCustomerDto.country,
                            address_type: inviteCustomerDto.address_type,
                            type: '',
                            document: '',
                            pan_document: '',
                            photo: '',
                        },
                    },
                    { upsert: true },
                );
        }

        await this.customerRepository
            // Connecting customer to the advisor.
            .updateUserCustomer(
                {
                    customer_id: customer.id,
                    user_id: session.user_id,
                    account_id: session.account_id,
                },
                { is_first_contact: !resCreateCustomer.data.is_existing_customer },
                { upsert: true },
            );

        const advisor = await this.customerRepository
            // Getting the advisor details.
            .findUser({ _id: session.user_id }, 'id name');

        // TODO: Move this to event listener.
        const clientUrl = this.configService.get<string>('CLIENT_URL');
        const actionUrl = new URL(`${clientUrl}/know-your-customer/${customer.id}/hyper-verge`);

        this.mailerService.sendTemplateEmail({
            brand_name: BrandName.BIDD,
            template_name: 'customer-invite.hbs',
            template_params: {
                ...customer,
                action_url: actionUrl.href,
                invite_sender_name: advisor.name,
            },
            subject: 'Bidd | Consent for Onboarding',
            to_emails: [customer.email],
        });

        // TODO: Test this method with partial UpdateCustomerDmo data.
        const resUpdateCustomer = await this.onboardingService
            // Updating customer details in BIDD.
            .updateCustomer(
                new UpdateCustomerDmo({
                    pan_number: inviteCustomerDto.pan_number,
                    name: inviteCustomerDto.name,
                    birth_date: inviteCustomerDto.birth_date,
                    connection_type: ConnectionType.BIDD,
                    access_token: resCreateCustomer.data.access_token,
                }),
            );

        if (!resUpdateCustomer.success) {
            return {
                success: false,
                message: resUpdateCustomer.message,
            };
        }

        return {
            success: true,
            message: `Customer invitation has been sent to ${customer.email}.`,
            data: customer,
        };
    }

    async syncCustomer(customerId: ObjectId, session: SessionUser) {
        // TODO: Access control check with session user.
        const customer = await this.customerRepository
            // Getting the customer details.
            .findOne({ _id: customerId }, 'id email pan_number connections');

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        const errors = [];

        for (const connection of customer.connections) {
            const resGetAccessToken = await this.onboardingService
                // Getting customer access token.
                .getAccessToken(connection.type, connection.refresh_token);

            if (!resGetAccessToken.success) {
                errors.push({
                    code: `GET_${connection.type}_ACCESS_TOKEN`,
                    message: resGetAccessToken.message,
                });
            } else {
                // Updating access token for the connection.
                await this.customersRepository.updateCustomer(
                    { _id: customerId, 'connections.type': connection.type },
                    { 'connections.$.access_token': resGetAccessToken.data.token },
                );
            }

            const resGetCustomerStatus = await this.onboardingService
                // Getting customer kyc status from B2C.
                .getCustomerStatus(connection, {
                    email: customer.email,
                    pan_number: customer.pan_number,
                });

            if (!resGetCustomerStatus.success) {
                errors.push({
                    code: `GET_${connection.type}_CUSTOMER_STATUS`,
                    message: resGetCustomerStatus.message,
                });
            } else {
                // Updating customer status.
                await this.customersRepository.updateCustomer(
                    { _id: customerId, 'connections.type': connection.type },
                    { 'connections.$.kyc_status': resGetCustomerStatus.data.status },
                );

                // Getting customer kyc id if kyc is verified.
                if (resGetCustomerStatus.data.status === CustomerKycStatus.KYC_VERIFIED) {
                    const resGetKycId = await this.onboardingService.getKycId(connection);

                    if (!resGetKycId.success) {
                        errors.push({
                            code: `GET_${connection.type}_CUSTOMER_ID`,
                            message: resGetKycId.message,
                        });
                    } else {
                        // Updating kyc id for the connection.
                        await this.customersRepository.updateCustomer(
                            { _id: customerId, 'connections.type': connection.type },
                            { 'connections.$.kyc_id': resGetKycId.data.custId },
                        );
                    }
                }
            }
        }

        if (errors.length) {
            return {
                success: false,
                message: 'Could not sync customer.',
                errors,
            };
        }

        return {
            success: true,
            message: 'Customer synced successfully.',
        };
    }

    async validatePan(session: SessionUser, validatePanDto: ValidatePanDto): Promise<ResProps> {
        const advisor = await this.customerRepository
            // Getting the user details.
            .findUser({ _id: session.user_id }, 'id api_token');

        const resGetAccessToken = await this.onboardingService
            // Getting access token for the advisor.
            .getAccessToken(ConnectionType.ICM, advisor.api_token);

        if (!resGetAccessToken.success) {
            return {
                success: false,
                message: resGetAccessToken.message,
            };
        }

        const resGetPanDetails = await this.onboardingService
            // Matching the given pan details.
            .getPanDetails(
                new GetPanDetailsDto({
                    pan_number: validatePanDto.pan_number,
                    birth_date: validatePanDto.birth_date,
                    name: validatePanDto.name,
                    access_token: resGetAccessToken.data.token,
                }),
            );

        if (!resGetPanDetails.success) {
            return {
                success: false,
                message: resGetPanDetails.message,
            };
        }

        const customer = await this.customerRepository
            // Getting the user details.
            .findOne({ pan_number: resGetPanDetails.data.pan });

        if (customer) {
            return {
                success: true,
                data: customer,
            };
        }

        return {
            success: true,
            data: {
                ...resGetPanDetails.data,
                name: resGetPanDetails.data.full_name,
            },
        };
    }

    async getVerificationToken(params: VerificationTokenDto): Promise<ResProps> {
        const customer = await this.customerModel
            .findOne({ _id: params.customer_id })
            .select('connections name');

        // Updating bank details.
        customer.income = params.income;
        customer.gender = params.gender;
        customer.birth_date = params.birth_date;
        customer.demat_number = params.demat_number;
        customer.account_number = params.account_number;
        customer.ifsc_code = params.ifsc_code;

        const access = await this.bondsService.refreshToken(customer);
        customer.setConnectionValue(ConnectionType.ICM, 'access_token', access.data.token);
        customer.save();

        const bankData = await this.bondsService.getVerificationToken(customer);

        console.log('🚀 ~ CustomersService ~ getVerificationToken ~ bankData:', bankData);

        if (bankData.success) {
            customer.is_bank_verified = true;
            await customer.save();

            return {
                success: true,
                data: { request_id: bankData.result?.validationRequestId },
            };
        }

        return { success: false, message: bankData.error };
    }

    async getPennyDropStatus(params): Promise<ResProps> {
        const customer = await this.customerModel
            .findOne({ _id: params.customer_id })
            .select('connections name account_number ifsc_code pan_number');

        const access = await this.bondsService.refreshToken(customer);
        customer.setConnectionValue(ConnectionType.ICM, 'access_token', access.data.token);

        const dropStatus = await this.bondsService.getPennyDropStatus(
            params.request_id,
            access.data.token,
        );

        console.log('🚀 ~ CustomersService ~ getPennyDropStatus ~ dropStatus:', dropStatus);

        if (!dropStatus.success) {
            return {
                success: false,
                message: 'Could not verify.',
            };
        }

        const resUpdateBankAccount = await this.bondsService.updateBankAccount(customer);
        console.log(
            '🚀 ~ CustomersService ~ getPennyDropStatus ~ resUpdateBankAccount:',
            resUpdateBankAccount,
        );

        if (dropStatus.result === 'active') {
            if (resUpdateBankAccount.success) {
                return {
                    success: true,
                    data: { status: dropStatus.result },
                    message: 'Account verified and details saved',
                };
            } else {
                return {
                    success: false,
                    errors: [
                        {
                            code: `PENNY_DROP_${dropStatus.result.toUpperCase()}`,
                            message: resUpdateBankAccount.message,
                        },
                    ],
                };
            }
        }

        return {
            success: false,
            errors: [
                {
                    code: `PENNY_DROP_${dropStatus.result.toUpperCase()}`,
                    message: 'Account not yet verified',
                },
            ],
        };
    }

    async sendCustomerDocstoAdmin(customer_id: string): Promise<ResProps> {
        try {
            const customer = await this.customerModel.findOne({ _id: customer_id });
            const attachments = await this.attachmentService.getCustomerAttachments(customer_id);

            if (customer) {
                const uploadPromises = attachments
                    .filter((attachment) =>
                        Object.keys(B2CCustomerAttachmentMap).includes(attachment.type),
                    )
                    .map(async (attachment) => {
                        try {
                            const fileStream = await this.uploadService.downloadFile(
                                attachment.link,
                            );

                            const res = await this.bondsService.uploadCustomerDocs(
                                fileStream,
                                customer,
                                attachment,
                            );

                            return {
                                success: true,
                                message: 'Confirmation Sent',
                                data: res.data,
                            };
                        } catch (err) {
                            console.error(
                                `error while uploading docs during sending customer docs to admin for ${customer_id}`,
                                err,
                            );
                            return {
                                success: false,
                                message: 'Confirmation Failed',
                                data: err,
                            };
                        }
                    });

                const results = await Promise.all(uploadPromises);
                const allSuccess = results.every((result) => result.success === true);

                if (allSuccess) {
                    return {
                        success: true,
                        message: 'Confirmation sent successfully',
                    };
                } else {
                    return {
                        success: false,
                        message: 'Confirmation Failed for some files',
                    };
                }
            }
        } catch (err) {
            console.log(`error while sending customer docs to admin for ${customer_id}`, err);
            return {
                success: false,
                message: 'Confirmation Failed',
                data: err,
            };
        }
    }

    async uploadFile(
        customer_id: string,
        file: Express.Multer.File,
        session: SessionUser,
    ): Promise<ResProps> {
        const attachment = await this.attachmentService.createCustomerAttachment(file, {
            customer_id: customer_id,
            account_id: session.account_id,
            user_id: session.user_id,
        });

        return {
            success: true,
            message: 'File uploaded successfully.',
            data: {
                link: attachment.location,
            },
        };
    }

    async getCustomerUnlistedPortfolio(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });
        const access = await this.unlistedEquityService.refreshToken(customer);
        try {
            const customerUnlistedPortfolio =
                await this.unlistedEquityService.getCustomerUnlistedPortfolio(access.data.token);

            if (customerUnlistedPortfolio.success) {
                const response = customerUnlistedPortfolio.data;
                const { customer, ...restParams } = response;
                return {
                    success: true,
                    data: { customer, ...restParams },
                };
            } else {
                return {
                    success: false,
                    message: 'could not fetch customer unlisted portfolio',
                };
            }
        } catch (error) {
            console.error(`error while getting customer unlisted portfolio`, customer_id, error);
            return {
                success: false,
                message: 'could not fetch customer unlisted portfolio',
            };
        }
    }

    async getCustomerPortfolio(customer_id: string): Promise<ResProps> {
        const customerPortfolio = await this.customerModel.aggregate([
            { $match: { _id: new Types.ObjectId(customer_id) } },
            { $project: { name: '$name' } },
            {
                $lookup: {
                    from: 'payments',
                    localField: '_id',
                    foreignField: 'customer_id',
                    as: 'payments',
                    pipeline: [{ $match: { status: OrderStatus.ORDER_PROCESSED } }],
                },
            },
            { $addFields: { amount_invested: { $sum: '$payments.user_amount' } } },
            { $unwind: '$payments' },
            {
                $group: {
                    _id: {
                        customer_name: '$name',
                        amount_invested: '$amount_invested',
                    },
                    payments: {
                        $push: {
                            id: '$payments._id',
                            product_type: '$payments.product_type',
                            product_name: '$payments.product_name',
                            product_isin: '$payments.product_isin',
                            amount: '$payments.user_amount',
                            return_rate: '$payments.return_rate',
                            units: '$payments.units',
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    customer_name: '$_id.customer_name',
                    amount_invested: '$_id.amount_invested',
                    payments: '$payments',
                },
            },
        ]);

        return { success: true, data: customerPortfolio[0] };
    }

    async acceptRejectKyc(body: AcceptRejectKYCDto, customer_id: string): Promise<ResProps> {
        try {
            const customer = await this.customerModel.findOne({ _id: customer_id }).exec();

            const response = await this.bondsService.acceptRejectKyc(customer, body);

            if (response.success) {
                return {
                    success: true,
                    message: 'KYC updated',
                };
            }

            return {
                success: false,
                message: 'KYC not updated',
            };
        } catch (error) {
            console.log(
                '🚀 ~ file: customers.service.ts:980 ~ CustomersService ~ error:',
                error,
                body,
                customer_id,
            );

            return {
                success: false,
                error: error,
                message: 'Could not update kyc.',
            };
        }
    }

    async createCustomerMandate(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Could not find customer.',
            };
        }

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const banksData = await this.mutualFundService.fetchBanks(payload);

        const primaryBankId = banksData.result.filter((item) => item.isPrimary)[0]?.bankId || null;

        const mandateResponse = await this.mutualFundService.createCustomerMandate(
            {
                bankId: primaryBankId,
                pan: customer.pan_number,
            },
            payload,
        );
        console.log(
            '🚀 ~ CustomersService ~ createCuscreateCustomerMandatetomerUCC ~ mandateResponse:',
            mandateResponse,
        );

        if (mandateResponse.result.mandateId) {
            const mandateUrlResponse = await this.mutualFundService.generateMandateUrl(
                { bankId: primaryBankId, pan: customer.pan_number },
                payload,
            );

            customer['mandate_id'] = mandateResponse.result.mandateId;

            await customer.save();

            console.log(
                '🚀 ~ CustomersService ~ createCuscreateCustomerMandatetomerUCC ~ mandateUrlResponse:',
                mandateUrlResponse,
            );

            if (!mandateUrlResponse.success) {
                return {
                    success: false,
                    message: mandateUrlResponse.error,
                };
            }

            return {
                success: true,
                data: mandateUrlResponse?.result,
            };
        } else {
            return {
                message: 'Could not create Mandate',
                success: false,
            };
        }
    }

    async updateCustomerUCC(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Could not find customer.',
            };
        }

        const resGetCustomer = await this.bondsService.getCustomer(
            customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
        );

        console.log('🚀 ~ CustomersService ~ createCustomerUCC ~ resGetCustomer:', resGetCustomer);

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        const uccResponse = await this.mutualFundService.updateCustomerUcc(resGetCustomer, jwt);

        console.log('🚀 ~ CustomersService ~ updateCustomerUcc ~ uccResponse:', uccResponse);

        if (!uccResponse.success) {
            return {
                success: false,
                message: uccResponse.error,
            };
        }

        this.eventEmitter.emit('customer.ucc', new CustomerUccCreationEvent(customer));

        customer['client_code'] = uccResponse?.result?.bseUser?.clientCode;

        const phoneSecret = await this.sendPhoneCode({
            phone_number: customer.phone_number,
            phone_code: customer.phone_code,
            customer_id: customer_id,
        });

        const emailSecret = await this.sendEmailCode(customer.email);

        customer.email_secret = emailSecret;

        customer.phone_secret = phoneSecret;

        await customer.save();

        return {
            success: true,
            data: uccResponse.data,
            message: 'Ucc creation successfull',
        };
    }

    async createCustomerUCC(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Could not find customer.',
            };
        }

        const resGetCustomer = await this.bondsService.getCustomer(
            customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
        );

        console.log('🚀 ~ CustomersService ~ createCustomerUCC ~ resGetCustomer:', resGetCustomer);

        const payload = {
            userId: customer.getConnectionValue(ConnectionType.ICM, 'foreign_id').toString(),
            email: customer.email,
        };

        const secretKey = this.configService.get<string>('MUTUAL_FUNDS_JWT_SECRET');

        const jwt = this.jwtService.sign(payload, { secret: secretKey });

        const uccResponse = await this.mutualFundService.createCustomerUcc(resGetCustomer, jwt);

        console.log('🚀 ~ CustomersService ~ createCustomerUCC ~ uccResponse:', uccResponse);

        if (!uccResponse.success) {
            return {
                success: false,
                message: uccResponse.error,
            };
        }

        this.eventEmitter.emit('customer.ucc', new CustomerUccCreationEvent(customer));

        customer['client_code'] = uccResponse?.result?.bseUser?.clientCode;

        const phoneSecret = await this.sendPhoneCode({
            phone_number: customer.phone_number,
            phone_code: customer.phone_code,
            customer_id: customer_id,
        });

        const emailSecret = await this.sendEmailCode(customer.email);

        customer.email_secret = emailSecret;

        customer.phone_secret = phoneSecret;

        await customer.save();

        return {
            success: true,
            data: uccResponse.data,
            message: 'Ucc creation successfull',
        };
    }

    async getCustomerHyperVergePollingData(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Could not find customer.',
            };
        }

        const pollingResponse = await this.bondsHyperVergeService.getPollingData(
            customer.getConnectionValue(ConnectionType.BIDD, 'access_token'),
        );

        console.log(
            '🚀 ~ file: customers.service.ts:1200 ~ getCustomerHyperVergePollingData ~ pollingResponse:',
            pollingResponse,
        );

        if (!pollingResponse.success) {
            return {
                success: false,
                message: pollingResponse.message,
            };
        }

        return {
            success: true,
            data: pollingResponse.data,
            message: pollingResponse.message,
        };
    }

    async getCustomerHyperVergeData(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Could not find customer.',
            };
        }

        const hyperVergeToken = await this.bondsHyperVergeService.refreshToken(
            customer.getConnectionValue(ConnectionType.BIDD, 'access_token'),
        );

        if (!hyperVergeToken || !hyperVergeToken.success) {
            return {
                success: false,
                message: 'Failed to fetch hyperverge token',
            };
        }

        console.log(
            '🚀 ~ file: customers.service.ts:1200 ~ getCustomerHyperVergeData ~ hyperVergeToken:',
            hyperVergeToken,
        );

        const initialData = await this.bondsHyperVergeService.getInitialData(
            customer.getConnectionValue(ConnectionType.BIDD, 'access_token'),
        );

        console.log(
            '🚀 ~ file: customers.service.ts:1200 ~ getCustomerHyperVergeData ~ initialData:',
            initialData,
        );

        if (!initialData || !initialData.success) {
            return {
                success: false,
                message: 'Failed to fetch initial data',
            };
        }

        return {
            success: true,
            data: {
                hyperVergeToken: hyperVergeToken.data.token,
                icmToken: 'nrw57s7r26QDv0rGHpW0ZRGH2wYedlzq7DC2xYel',
                ...initialData.data,
            },
            message: 'Successfully fetched hyperverge initial data and token',
        };
    }

    async akycVerifyPan(session: SessionUser, body: AkycVerifyPanDto): Promise<ResProps> {
        const customerExists = await this.customerModel.exists({ pan_number: body.pan_number });

        if (customerExists) {
            const customerProfileExists = await this.customerRepository.getCustomerProfile(
                customerExists._id.toString(),
            );
            if (customerProfileExists?.all_details_filled) {
                return {
                    success: false,
                    error: AkycErrorPanValidation.PAN_EXISTS,
                };
            }
        }

        // Step 1
        const panVerificationResponse = await this.hyperVergeService.verifyPan(body);
        if (!panVerificationResponse.success) return panVerificationResponse;

        // Step 2
        const amlCheckResponse = await this.hyperVergeService.amlCheck(body);
        if (!amlCheckResponse.success) return amlCheckResponse;

        const amlHits = amlCheckResponse?.data?.hits;

        // create customer using private function
        const createCustomerResponse = await this.createCustomer(session, {
            pan_number: body.pan_number,
            name: body.name,
            email: body.email,
            phone_number: body.phone_number,
            product_type: ProductType.BOND,
            kyc_mode: KycMode.DIGILOCKER,
            birth_date: body.birth_date,
        });

        if (!createCustomerResponse.success)
            return { success: false, error: 'Failed to create customer' };

        const customer = createCustomerResponse.data as CustomerDocument;
        if (
            customer.getConnectionValue(ConnectionType.BIDD, 'kyc_status') ===
                CustomerKycStatus.KYC_VERIFIED &&
            customer.getConnectionValue(ConnectionType.ICM, 'kyc_status') ===
                CustomerKycStatus.KYC_VERIFIED
        ) {
            const customerProfile = await this.customerRepository.getCustomerProfile(customer.id);
            return {
                success: true,
                data: {
                    customer,
                    customerProfile,
                },
            };
        }

        // Step 3
        const ckycSearchResponse = await this.hyperVergeService.ckycSearch(body);
        let customerProfile: CustomerProfileDocument;
        try {
            customerProfile = await this.customerRepository.createAkycCustomerProfile({
                customer_id: customer.id,
                pan_number: body.pan_number,
                transaction_id: body.transactionId,
                birth_date: body.birth_date,
                name: body.name,
                ckyc_number: ckycSearchResponse.result.ckycNo,
                aml_hits: amlHits,
                review_required: amlHits?.length > 0,
            });
        } catch (e) {
            console.error(`error while verifying akyc pan`, body, e);
            return {
                success: false,
                error: e.message,
            };
        }

        return {
            success: true,
            message: 'PAN checks successful',
            data: {
                ckycData: ckycSearchResponse.result,
                profileStatus: CustomerProfileStatus.DETAILS_PENDING,
                customer,
                customerProfile,
            },
        };
    }

    async akycVerifyBankAccount(
        session: SessionUser,
        body: AkycSubmitCustomerProfileDto,
    ): Promise<ResProps> {
        const response = await this.hyperVergeService.pennyDropVerification(body);
        if (!response.success) {
            return {
                success: false,
                message: 'Failed to verify bank account',
                error: response.error,
            };
        }

        try {
            await this.customerRepository.createAkycCustomerProfile({
                pan_number: body.pan_number,
                transaction_id: body.transactionId,
                bank_account: {
                    number: body.bank_account.number,
                    ifsc_code: body.bank_account.ifsc,
                    type: body.bank_account.type,
                    name: response.data.result.accountName,
                    verified: true,
                },
                citizenship: body.citizenship,
                fathers_name: body.fathers_name,
                income_range: body.income_range,
                marital_status: body.marital_status,
                occupation: body.occupation,
                residential_status: body.residential_status,
                gender: body.gender,
            });
        } catch (e) {
            return {
                success: false,
                error: e.message,
            };
        }

        return {
            success: true,
            message: 'Bank account verified successfully',
            data: response.data,
        };
    }

    async akycVerifyCancelledCheque(
        session: SessionUser,
        body: AkycSubmitCustomerProfileDto,
    ): Promise<ResProps> {
        const cancelledChequeScanResponse =
            await this.hyperVergeService.cancelledChequeVerification(body);
        if (body.bank_account.number !== cancelledChequeScanResponse.data?.account_number) {
            return {
                success: false,
                error: `Account number does not match with the cancelled cheque`,
            };
        } else if (body.bank_account.ifsc !== cancelledChequeScanResponse.data?.ifsc_code) {
            return {
                success: false,
                error: `IFSC does not match with the cancelled cheque`,
            };
        }

        const response = await fetch(body.cancelled_cheque);
        const fileBlob = await response.blob();
        const arrayBuffer = await fileBlob.arrayBuffer();
        const file: FileType = {
            originalname: 'CANCELLED_CHEQUE',
            mimetype: 'image/png',
            buffer: Buffer.from(arrayBuffer),
            size: arrayBuffer.byteLength.toString(),
            fieldname: 'CANCELLED_CHEQUE',
        };

        let updatedProfile;

        try {
            updatedProfile = await this.customerRepository.createAkycCustomerProfile({
                pan_number: body.pan_number,
                transaction_id: body.transactionId,
                bank_account: {
                    number: body.bank_account.number,
                    ifsc_code: body.bank_account.ifsc,
                    type: body.bank_account.type,
                    verified: true,
                },
                citizenship: body.citizenship,
                fathers_name: body.fathers_name,
                income_range: body.income_range,
                marital_status: body.marital_status,
                occupation: body.occupation,
                residential_status: body.residential_status,
                gender: body.gender,
            });
        } catch (e) {
            return {
                success: false,
                error: e.message,
            };
        }

        await this.attachmentService.createCustomerAttachment(file, {
            customer_id: updatedProfile.customer_id.toString(),
            account_id: session.account_id,
            user_id: session.user_id,
        });

        return { success: true, data: cancelledChequeScanResponse.data };
    }

    async akycSubmitCustomerProfile(session: SessionUser, body: AkycSubmitCustomerProfileDto) {
        const rmUser = await this.usersRepository.getUserById(session.user_id);
        let customerProfile;
        try {
            customerProfile = await this.customerRepository.createAkycCustomerProfile({
                pan_number: body.pan_number,
                transaction_id: body.transactionId,
                all_details_filled: true,
                customer_rejected: false,
                rejection_discrepency: '',
                name: body.name,
                phone_number: body.phone_number,
                email: body.email,
                gender: body.gender,
                income_range: body.income_range,
                birth_date: body.birth_date,
                bank_account: {
                    type: body.bank_account.type,
                    number: body.bank_account.number,
                    ifsc_code: body.bank_account.ifsc,
                    verified: body.bank_account.verified,
                    name: body.bank_account.name,
                },
                nominees: body.nominees
                    ? body.nominees.map((nominee) => ({
                          ...nominee,
                          relation: nominee.relationship,
                          guardian: nominee.guardian
                              ? {
                                    ...nominee.guardian,
                                    relation: nominee.guardian.relationship,
                                }
                              : undefined,
                      }))
                    : [],
                relationship_manager_name: rmUser.name,
                relationship_manager_email: rmUser.email,
                citizenship: body.citizenship,
                marital_status: body.marital_status,
                ckyc_number: body.ckyc_number,
                residential_status: body.residential_status,
                occupation: body.occupation,
                documents: {
                    cancelled_cheque: body.cancelled_cheque,
                },
                fathers_name: body.fathers_name,
                kyc_mode: KycMode.DIGILOCKER,
            });
        } catch (e) {
            return {
                success: false,
                error: e.message,
            };
        }

        const customer = await this.customerRepository.getCustomer(
            customerProfile.customer_id.toString(),
        );

        customer.setConnectionValue(
            ConnectionType.BIDD,
            'kyc_status',
            CustomerKycStatus.KYC_INITIATED,
        );
        customer.set('gender', body.gender);
        customer.set('kyc_mode', KycMode.DIGILOCKER);
        await customer.save();

        this.eventEmitter.emit(
            'customer.akyc_submitted',
            new AkycSubmitEvent({
                customer_id: customer.id,
                customerName: body.name,
                rmName: rmUser.name,
                email: body.email,
            }),
        );

        return {
            success: true,
            data: customerProfile,
        };
    }

    async okycSubmitProfile(
        session: SessionUser,
        submitOnboardingKycDto: SubmitOnboardingKycDto,
    ): Promise<ResProps> {
        const customer = await this.customersRepository.updateCustomer(
            { _id: submitOnboardingKycDto.customer_id },
            {
                gender: submitOnboardingKycDto.basic_details?.gender,
                birth_date: submitOnboardingKycDto.birth_date,
                kyc_mode: KycMode.ONLINE,
            },
        );

        await this.customersRepository.createCustomerProfile(
            new Types.ObjectId(submitOnboardingKycDto.customer_id),
            {
                type: submitOnboardingKycDto.type,
                pan_number: customer.pan_number,
                all_details_filled: true,
                aml_hits: [],
                review_required: false,
                name: submitOnboardingKycDto.name,
                phone_number: submitOnboardingKycDto.phone_number,
                email: submitOnboardingKycDto.email,
                birth_date: submitOnboardingKycDto.birth_date,
                fathers_name: submitOnboardingKycDto.basic_details?.fathers_name,
                gender: submitOnboardingKycDto.basic_details?.gender,
                marital_status: submitOnboardingKycDto.basic_details?.marital_status,
                residential_status: submitOnboardingKycDto.basic_details?.residential_status,
                occupation: submitOnboardingKycDto.basic_details?.occupation_type,
                income_range: submitOnboardingKycDto.basic_details?.gross_annual_income,
                bank_account: {
                    type: submitOnboardingKycDto.bank_account.type,
                    number: submitOnboardingKycDto.bank_account.number,
                    ifsc_code: submitOnboardingKycDto.bank_account.ifsc_code,
                    name: submitOnboardingKycDto.bank_account.name,
                },
                nominees: (submitOnboardingKycDto.nominees || []).map((nominee) => ({
                    name: nominee.name,
                    birth_date: nominee.birth_date,
                    allocation: nominee.allocation,
                    relation: nominee.relation,
                    other_relation: nominee.other_relation,
                    guardian: nominee.guardian,
                })),
                declaration: submitOnboardingKycDto.declaration,
                correspondance_address: submitOnboardingKycDto?.correspondance_address,
                registration_number: submitOnboardingKycDto.company_details?.registration,
                profileType: submitOnboardingKycDto.profileType,
                company_details: submitOnboardingKycDto.company_details,
                related_party_details: submitOnboardingKycDto.related_party_details,
                ultimate_beneficial_owner: submitOnboardingKycDto.ultimate_beneficial_owner,
                key_member_details: submitOnboardingKycDto.key_member_details,
                fatca_declaration: submitOnboardingKycDto.fatca_declaration,
                documents: {
                    ...(submitOnboardingKycDto.documents || {}),
                    cancelled_cheque: submitOnboardingKycDto.bank_account?.document,
                },
                kyc_mode: KycMode.ONLINE,
            } as Partial<CustomerProfile>,
        );

        await this.okycSendPrefilledForm(session, submitOnboardingKycDto.customer_id);

        return {
            success: true,
            message: 'Profile saved and KYC email sent to customer',
        };
    }

    async okycSendPrefilledForm(session: SessionUser, customer_id: string): Promise<ResProps> {
        const customer = await this.customersRepository.getCustomer(customer_id);

        const customerProfile = await this.customersRepository.getCustomerProfile(customer_id);

        const onboardingFromDto =
            customerProfile.type === CustomerProfileType.INDIVIDUAL
                ? new IndividualOnboardingFormDto(customerProfile)
                : new NonIndividualOnboardingFormDto(customerProfile);
        let onboardingFormImagesDto: OnboardingFormImagesDto;
        if (customerProfile.type === CustomerProfileType.INDIVIDUAL) {
            onboardingFormImagesDto = new OnboardingFormImagesDto(customerProfile);
            await onboardingFormImagesDto.resolveImages(this.utilityService.imageUrlToBase64);
        }

        const resPrepareOnboardingForm = await this.digioService.prepareOnboardingForm(
            customerProfile.type,
            onboardingFromDto,
            onboardingFormImagesDto,
        );

        const file = {
            originalname: `${customer.id}-kyc-form.pdf`,
            mimetype: 'application/pdf',
            buffer: Buffer.from(resPrepareOnboardingForm),
            size: Buffer.from(resPrepareOnboardingForm).length,
            fieldname: 'kyc-form',
        };

        const attachment = await this.attachmentService.createKycFormAttachment(
            file as Express.Multer.File,
            {
                customer_id: customer.id,
                account_id: session.account_id.toString(),
            },
        );

        await this.customersRepository.updateKycFormAttachment(customer.id, attachment.id);

        customer.setConnectionValue(
            ConnectionType.ICM,
            'kyc_status',
            CustomerKycStatus.KYC_INITIATED,
        );
        customer.setConnectionValue(
            ConnectionType.BIDD,
            'kyc_status',
            CustomerKycStatus.KYC_INITIATED,
        );
        await customer.save();

        this.eventEmitter.emit(
            'customer.okyc_submit',
            new CustomerOkycSubmitEvent({
                id: customer.id,
                email: customer.email,
                kyc_form: resPrepareOnboardingForm,
                attachment_name: file.originalname,
                name: customerProfile.name,
            }),
        );

        return {
            success: true,
        };
    }

    /**
     * Returns the following in the response:
     * - The customer profile document
     * - The customer document
     *
     * @param query accepts the customer_id of the customer being onboarded
     */
    async getCustomerProfile(customer_id: string): Promise<ResProps> {
        const customer = await this.customerRepository.getCustomer(customer_id);
        const customerProfile = await this.customerRepository.getCustomerProfile(customer_id);

        return {
            success: true,
            data: {
                customerProfile: customerProfile?.toJSON(),
                customer: customer?.toJSON(),
            },
        };
    }

    async akycSendCustomerOtp(akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto) {
        const { customer_id } = akycGetCustomerProfileQueryDto;

        const customer = await this.customerRepository.getCustomer(customer_id);
        const { phone_code, phone_number, email } = customer;

        const phoneSecret = await this.sendPhoneCode({
            customer_id,
            phone_code,
            phone_number,
        });

        const emailSecret = await this.sendEmailCode(email);
        customer.phone_secret = phoneSecret;

        customer.email_secret = emailSecret;

        await customer.save();
    }

    async checkLocation(checkLocationDto: CheckLocationDto): Promise<ResProps> {
        const INDIA_BOUNDS = {
            lat: {
                min: 6.4626999,
                max: 35.6733149,
            },
            lng: {
                min: 68.1097,
                max: 97.39535869999999,
            },
        };

        const result =
            checkLocationDto.latitude >= INDIA_BOUNDS.lat.min &&
            checkLocationDto.latitude <= INDIA_BOUNDS.lat.max &&
            checkLocationDto.longitude >= INDIA_BOUNDS.lng.min &&
            checkLocationDto.longitude <= INDIA_BOUNDS.lng.max;

        const transaction_id = uuid();
        const place = await this.hyperVergeService.getGeoLocation(checkLocationDto, transaction_id);

        const customerProfile = await this.customerRepository.getCustomerProfile(
            checkLocationDto.customer_id,
        );

        customerProfile.set('place', place);
        await customerProfile.save();

        return {
            success: result,
        };
    }

    async akycValidateSelfie(
        akycValidateSelfieDto: AkycValidateSelfieDto,
        files: Express.Multer.File[],
    ): Promise<ResProps> {
        const customerProfile = await this.customerRepository.getCustomerProfile(
            akycValidateSelfieDto.customer_id,
        );

        const getIdCardResponse = await axios.get(customerProfile.documents.poa_document, {
            responseType: 'arraybuffer',
        });
        const idCard = Buffer.from(getIdCardResponse.data, 'binary');

        const selfie = files[0];
        const selfieValidationResponse = await this.hyperVergeService.selfieVerification(
            akycValidateSelfieDto,
            selfie,
            idCard,
        );
        if (selfieValidationResponse.success) {
            const selfieUrl = await this.uploadFileFromBuffer(
                selfie.buffer,
                akycValidateSelfieDto.customer_id,
                'selfie',
            );
            customerProfile.set('documents.photo', selfieUrl);
            await customerProfile.save();
        }
        return selfieValidationResponse;
    }

    async akycValidateSignature(
        akycValidateSelfieDto: AkycValidateSelfieDto,
        files: Express.Multer.File[],
    ): Promise<ResProps> {
        const signature = files[0];

        const signatureValidationResponse = await this.hyperVergeService.signatureVerification(
            akycValidateSelfieDto,
            signature,
        );

        if (signatureValidationResponse.success) {
            const signatureUrl = await this.uploadFileFromBuffer(
                signature.buffer,
                akycValidateSelfieDto.customer_id,
                'SIGNATURE',
            );
            const customerProfile = await this.customerRepository.getCustomerProfile(
                akycValidateSelfieDto.customer_id,
            );
            customerProfile.set('documents.signature', signatureUrl);
            await customerProfile.save();
        }

        return signatureValidationResponse;
    }

    async akycGetEsignDocumentId(
        akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto,
    ): Promise<ResProps> {
        const customer = await this.customerRepository.getCustomer(
            akycGetCustomerProfileQueryDto.customer_id,
        );
        const customerProfile = await this.customerRepository.getCustomerProfile(
            akycGetCustomerProfileQueryDto.customer_id,
        );

        if (!customer.aof_digio_doc_id) {
            const onboardingFromDto = new IndividualOnboardingFormDto({
                ...customerProfile.toJSON(),
                date: new Date().toDateString(),
            });
            const onboardingFormImagesDto = new OnboardingFormImagesDto(customerProfile);
            await onboardingFormImagesDto.resolveImages(this.utilityService.imageUrlToBase64);

            const resCreateDocument = await this.digioService.createDocument({
                name: customer.name,
                email: customer.email,
                onboardingFromDto,
                onboardingFormImagesDto,
            });
            console.log(
                '🚀 ~ AuthService ~ createAgreement ~ resCreateDocument:',
                resCreateDocument,
            );

            if (!resCreateDocument.id) {
                return {
                    success: false,
                    message: 'Could not create document.',
                };
            }

            customer.set('aof_digio_doc_id', resCreateDocument.id);
            await customer.save();
        }

        return {
            success: true,
            data: {
                email: customer.email,
                digio_doc_id: customer.aof_digio_doc_id,
            },
        };
    }

    async akycDigilockerCreateRequest(
        akycDigilockerRequestDto: AkycDigilockerRequestDto,
    ): Promise<ResProps> {
        const { customer_id, reset } = akycDigilockerRequestDto;

        const customer = await this.customerRepository.getCustomer(customer_id);

        if (!customer) {
            return {
                success: false,
                error: 'Customer not found',
                message: 'Customer not found',
            };
        }

        const digilockerRequestTokenValidity = customer.digilocker_request_token?.valid_till;

        if (digilockerRequestTokenValidity && !reset) {
            const digilockerRequestTokenValidityDate = new Date(digilockerRequestTokenValidity);
            const now = new Date();
            if (now < digilockerRequestTokenValidityDate) {
                // Token is still valid
                return {
                    success: true,
                    data: customer.digilocker_request_token,
                };
            } else if (customer.digilocker_request_token?.doc_id) {
                const newToken = await this.digioService.refreshToken(
                    customer.digilocker_request_token.doc_id,
                );
                customer.set('digilocker_request_token', {
                    doc_id: customer.digilocker_request_token.doc_id,
                    token: newToken.id,
                    valid_till: newToken.valid_till,
                });
                customer.save();
                return {
                    success: true,
                    data: customer.digilocker_request_token,
                };
            }
        }

        const digilockerCreateRequestResponse = await this.digioService.digilockerCreateRequest(
            customer,
        );

        const {
            entity_id: doc_id,
            id: token,
            valid_till,
        } = digilockerCreateRequestResponse.access_token;

        customer.set('digilocker_request_token', {
            doc_id,
            token,
            valid_till,
        });

        customer.save();

        return {
            success: true,
            data: customer.digilocker_request_token,
        };
    }

    async uploadFileFromBuffer(buffer: Buffer, customer_id: string, filename: string, pdf = false) {
        const fileId = uuid();
        const file: FileType = {
            mimetype: pdf ? 'application/pdf' : 'image/png',
            buffer,
            originalname: `${filename}-${fileId}.${pdf ? 'pdf' : 'png'}`,
            size: buffer.byteLength.toString(),
            fieldname: filename,
        };
        const attachment = await this.attachmentService.createCustomerAttachment(file, {
            customer_id: customer_id,
        });
        return attachment.location;
    }

    async akycDigilockerCheckData(
        akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto,
    ): Promise<ResProps> {
        const { customer_id } = akycGetCustomerProfileQueryDto;

        const customer = await this.customerRepository.getCustomer(customer_id);

        if (!customer) {
            return {
                success: false,
                error: 'Customer not found',
                message: 'Customer not found',
            };
        }

        const customerProfile = await this.customerRepository.getCustomerProfile(customer_id);

        if (!customerProfile) {
            return {
                success: false,
                error: 'Customer profile not found',
                message: 'Customer profile not found',
            };
        }

        if (customerProfile.aadhaar_details && customerProfile.pan_details) {
            return {
                success: true,
                data: {
                    aadhaarDetails: customerProfile.aadhaar_details,
                    panDetails: customerProfile.pan_details,
                },
            };
        }

        const { aadhaarDetails, panDetails, aadhaarImage, panImage } =
            await this.digioService.getKycResponse(customer.digilocker_request_token?.doc_id);

        if (panDetails.id_number.toLowerCase() !== customer.pan_number.toLowerCase()) {
            return {
                success: false,
                error: 'Aadhaar details do not match with the PAN entered by your relationship manager',
                message:
                    'Aadhaar details do not match with the PAN entered by your relationship manager',
            };
        }

        const aadhaarUrl = await this.uploadFileFromBuffer(aadhaarImage, customer_id, 'ADDRESS');
        const panUrl = await this.uploadFileFromBuffer(panImage, customer_id, 'PAN');

        customerProfile.set('correspondance_address', {
            line_1: aadhaarDetails.current_address_details.address,
            line_2: aadhaarDetails.current_address_details.locality_or_post_office,
            city: aadhaarDetails.current_address_details.district_or_city,
            state: aadhaarDetails.current_address_details.state,
            pin_code: aadhaarDetails.current_address_details.pincode,
            country: 'India',
        });

        customerProfile.set('aadhaar_details', aadhaarDetails);
        customerProfile.set('pan_details', panDetails);
        customerProfile.set('documents.poa_type', AddressProofType.AADHAAR);
        customerProfile.set('documents.poa_document', aadhaarUrl);
        customerProfile.set('documents.pan_document', panUrl);
        await customerProfile.save();

        return {
            success: true,
            data: {
                aadhaarDetails,
                panDetails,
            },
        };
    }

    async submitSignedForm(submitSignedFormDto: SubmitSignedFormDto): Promise<ResProps> {
        const { customer_id, signed_form_link } = submitSignedFormDto;

        const customerProfile = await this.customerRepository.saveKycSignedForm(
            customer_id,
            signed_form_link,
        );

        const customer = await this.customerRepository.getCustomer(customer_id);

        const incomeCategoryMap = {
            LT_1_LAKH: '1',
            '1_5_LAKH': '2',
            '5_10_LAKH': '3',
            '10_25_LAKH': '4',
            GT_25_LAKH: '5',
        };

        try {
            const data = new SubmitFullKycDataDto(customerProfile);
            const response = await this.bondsHyperVergeService.submitFullKycData(
                customer.getConnectionValue(ConnectionType.BIDD, 'access_token'),
                data,
            );
            await this.sendCustomerDocstoAdmin(customer.id);
            await this.bondsService.updateThirdPartyData(
                customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
                {
                    name: customer.name,
                    pan: customer.pan_number,
                    gender: customer.gender == Gender.MALE ? 'M' : 'F',
                    income: incomeCategoryMap[customerProfile.income_range],
                    dob: customer.birth_date,
                    demat: customerProfile.demat_account?.number,
                    accountNumber: customerProfile.bank_account?.number,
                    ifscCode: customerProfile.bank_account?.ifsc_code,
                    addressDocType: 'address',
                    addressDetails: {
                        address: customerProfile.correspondance_address.line_1,
                        state: customerProfile.correspondance_address.state,
                        districtOrCity: customerProfile.correspondance_address.city,
                        pincode: customerProfile.correspondance_address.pin_code,
                        localityOrPostOffice: customerProfile.correspondance_address.line_2,
                        country: 'India',
                    },
                } as ThirdPartyCustomerDto,
            );
            customer.setConnectionValue(
                ConnectionType.ICM,
                'kyc_status',
                CustomerKycStatus.KYC_SUBMITTED,
            );
            await customer.save();
            console.log('B2C KYC Submit response', response);
        } catch (e) {
            console.error('Failed to push KYC data to B2C', e, submitSignedFormDto);
        }

        return {
            success: true,
            data: {
                ...customerProfile,
            },
        };
    }

    async akycCustomerRejectKyc(
        akycCustomerRejectKycDto: AkycCustomerRejectKycDto,
    ): Promise<ResProps> {
        // update customer status
        const customer = await this.customerRepository.getCustomer(
            akycCustomerRejectKycDto.customer_id,
        );
        const customerProfile = await this.customerRepository.getCustomerProfile(
            akycCustomerRejectKycDto.customer_id,
        );

        customer.setConnectionValue(
            ConnectionType.BIDD,
            'kyc_status',
            CustomerKycStatus.BASIC_DETAILS_ENTERED,
        );
        customerProfile.set('all_details_filled', false);
        customerProfile.set('customer_rejected', true);
        customerProfile.set('rejection_discrepency', akycCustomerRejectKycDto.discrepency);
        await customer.save();
        await customerProfile.save();

        // emit event
        this.eventEmitter.emit(
            'customer.akyc_customer_reject',
            new CustomerAkycRejectEvent({
                customer_name: customer.name,
                rm_email: customerProfile.relationship_manager_email,
                discrepency: akycCustomerRejectKycDto.discrepency,
            }),
        );

        return {
            success: true,
        };
    }

    async convertPdfToImage(files: Express.Multer.File[]): Promise<string> {
        const requestId = uuid();
        const pdfFile = files[0];

        // Save PDF to local file
        const pdfBuffer = pdfFile.buffer;
        fs.mkdirSync(`./tmp/${requestId}`, { recursive: true });
        fs.writeFileSync(`./tmp/${requestId}/pdf.pdf`, pdfBuffer);

        // Convert PDF to image using gm
        await execPromise(`gm convert ./tmp/${requestId}/pdf.pdf ./tmp/${requestId}/image.png`);

        // Read image file in base64
        const imageBuffer = fs.readFileSync(`./tmp/${requestId}/image.png`);
        const imageBase64 = imageBuffer.toString('base64');

        // delete the request's folder
        rimrafSync(`./tmp/${requestId}`);

        // return base64 image
        return imageBase64;
    }

    async akycFetchSignedForm(
        akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto,
    ): Promise<ResProps> {
        const { customer_id } = akycGetCustomerProfileQueryDto;

        const customer = await this.customerRepository.getCustomer(customer_id);

        const signedForm = await this.digioService.getSignedForm(customer.aof_digio_doc_id);

        const signedFormUrl = await this.uploadFileFromBuffer(
            Buffer.from(signedForm),
            customer_id,
            'signed_form',
            true,
        );

        await this.submitSignedForm({
            customer_id,
            signed_form_link: signedFormUrl,
        });

        return {
            success: true,
        };
    }

    async getDematDetails(
        customer_id: string,
        getDematDetailsDto: GetDematDetailsDto,
    ): Promise<ResProps> {
        const { demat_number } = getDematDetailsDto;
        const customer = await this.customerModel.findById(customer_id);
        const access = await this.unlistedEquityService.refreshToken(customer);

        if (customer) {
            const dematData = await this.bondsService.validateDematNumber(
                demat_number,
                access.data.token,
            );

            console.log('🚀 ~ CustomersService ~ dematBroker:', dematData);

            if (dematData.success) {
                return {
                    success: true,
                    data: dematData?.data?.[0],
                    message: 'Valid Demat Number',
                };
            }
            return { success: false, message: 'Invalid Demat Number' };
        } else {
            throw new NotFoundException('User not found.');
        }
    }
}
