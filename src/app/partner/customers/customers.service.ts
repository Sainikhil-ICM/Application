import { Injectable } from '@nestjs/common';
import { GetCustomersReqDto } from './dto/request/get-customers.req.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
    Customer,
    CustomerDocument,
    CustomerStatics,
    ConnectionType,
} from 'src/models/customer.model';
import { Model } from 'mongoose';
import { CreateCustomerReqDto } from './dto/request/create-customer.req.dto';
import BondsService from 'src/services/bonds.service';
import { Account, AccountDocument } from 'src/models/account.model';
import { AttachmentTypeMap } from 'src/constants/attachment.const';
import { UpdateCustomerReqDto } from './dto/request/update-customer.req.dto';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { UserCustomer, UserCustomerDocument } from 'src/models/user-customer.model';
import { CustomerResDto } from './dto/response/customer.res.dto';
import { SessionAccount } from 'src/constants/account.const';
import AttachmentService from 'src/services/attachment.service';
import { ResProps } from 'src/constants/constants';

@Injectable()
export class CustomersService {
    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument> & CustomerStatics,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        @InjectModel(UserCustomer.name)
        private userCustomerModel: Model<UserCustomerDocument>,
        private attachmentService: AttachmentService,
        private readonly bondsService: BondsService,
    ) {}

    async getCustomers(account_id: string, query: GetCustomersReqDto): Promise<ResProps> {
        const customerIds = await this.userCustomerModel.distinct('customer_id', { account_id });

        const queryParams: any = { _id: { $in: customerIds }, pan_number: { $exists: true } };

        if (query.name) {
            queryParams['name'] = { $regex: new RegExp(query.name, 'i') };
        }

        if (query.status) {
            queryParams['status'] = { $regex: new RegExp(query.status, 'i') };
        }

        const [customerCount, customers] = await Promise.all([
            this.customerModel.countDocuments(queryParams),
            this.customerModel
                .find(queryParams)
                .sort({ updated_at: 'desc' })
                .skip((query.page - 1) * query.per_page)
                .limit(query.per_page),
        ]);

        return {
            success: true,
            data: {
                total_count: customerCount,
                collection: customers.map((customer) => {
                    return new CustomerResDto(customer.toJSON());
                }),
            },
        };
    }

    async createCustomer(
        session: SessionAccount,
        body: CreateCustomerReqDto,
        files: Express.Multer.File[],
    ): Promise<ResProps> {
        const errors = [];

        const resGetPanDetails = await this.bondsService.getPanDetails(session.user_api_token, {
            pan_number: body.pan_number,
            birth_date: body.birth_date,
            name: body.name,
        });

        console.log('🚀 ~ CustomersService ~ resGetPanDetails:', resGetPanDetails);

        if (!resGetPanDetails.success) {
            return {
                success: false,
                message: 'Pan validation failed, please check the errors.',
                errors: [
                    {
                        code: 'CUSTOMER_PAN_VALIDATION_FAILED_B2C',
                        message: resGetPanDetails.message,
                    },
                ],
            };
        }

        const resCreateCustomer = await this.bondsService.createCustomer({
            account_code: session.account_code,
            name: body.name,
            email: body.email,
            phone_number: body.phone_number,
        });

        console.log('🚀 ~ CustomersService ~ resCreateCustomer:', resCreateCustomer);

        if (!resCreateCustomer.success) {
            // TODO - log the error
            return {
                success: false,
                message: 'Could not onboard customer, please contact support.',
                errors: [
                    {
                        code: 'CUSTOMER_CREATE_FAILED_B2C',
                        message: resCreateCustomer.message,
                    },
                ],
            };
        }

        let customer: CustomerDocument | undefined | null;

        const existingCustomer = await this.customerModel.getCustomerByForeignId(
            ConnectionType.ICM,
            resCreateCustomer.data.foreign_id,
        );

        if (existingCustomer) {
            customer = existingCustomer;

            const userCustomer = await this.userCustomerModel.findOne({
                customer_id: existingCustomer.id,
                user_id: session.user_id,
            });

            if (userCustomer) {
                // TODO: Send to customer update flow when customer is already
                // linked to the advisor and is not KYC verified.
                return {
                    success: false,
                    message: 'Could not onboard customer, please check the errors.',
                    errors: [
                        {
                            code: 'CUSTOMER_CREATE_DUPLICATE',
                            message: 'Customer is already linked to your account.',
                        },
                    ],
                };
            }

            if (
                existingCustomer.getConnectionValue(ConnectionType.ICM, 'kyc_status') ===
                    CustomerKycStatus.KYC_VERIFIED &&
                existingCustomer.getConnectionValue(ConnectionType.BIDD, 'kyc_status') ===
                    CustomerKycStatus.KYC_VERIFIED
            ) {
                await this.userCustomerModel.create({
                    customer_id: existingCustomer.id,
                    user_id: session.user_id,
                    account_id: session.account_id,
                });

                return {
                    success: true,
                    message: 'Customer successfully linked to your account.',
                };
            }
        } else {
            const customerParams = { ...body, ...resCreateCustomer.data };
            const newCustomer = await this.customerModel.create({ ...customerParams });
            customer = newCustomer;
        }

        // Linking customer to the advisor.
        await this.userCustomerModel.create({
            customer_id: customer.id,
            user_id: session.user_id,
            account_id: session.account_id,
        });

        const access = await this.bondsService.refreshToken(customer);
        customer.setConnectionValue(ConnectionType.ICM, 'access_token', access.data.token);

        const resUpdateCustomer = await this.bondsService.updateCustomer(customer);
        console.log('🚀 ~  CustomersService ~ resUpdateCustomer:', resUpdateCustomer);

        if (!resUpdateCustomer.success) {
            return {
                success: false,
                message: 'Could not onboard customer, please check the errors.',
                errors: [
                    {
                        code: 'CUSTOMER_UPDATE_FAILED_B2C',
                        message: resUpdateCustomer['msg'],
                    },
                ],
            };
        }

        const resUpdateBankAccount = await this.bondsService.updateBankAccount(customer);
        console.log('🚀 ~ CustomersService ~ resUpdateBankAccount:', resUpdateBankAccount);

        // TODO - review this @jayincred
        // if (!resSaveAccountDetails.success) {
        //     return {
        //         success: false,
        //         data: customer,
        //         message: 'Could not save account details, please contact support.',
        //     };
        // }

        await Promise.all(
            ['address', 'pan', 'cancelled_cheque'].map(async (fileType) => {
                const fieldName = `${fileType}_attachment`;
                const file = files.find((file) => file.fieldname === fieldName);

                if (file) {
                    try {
                        const resUploadPartnerDocs = await this.bondsService.uploadPartnerDocs(
                            file,
                            customer,
                        );
                        console.log(
                            '🚀 ~ CustomersService ~ resUploadPartnerDocs:',
                            resUploadPartnerDocs,
                        );

                        // TODO: Need to refactor with customer_attachments
                        // await this.attachmentService.createAttachment(file, {
                        //     customer_id: customer.id,
                        //     account_id: session.account_id,
                        // });
                    } catch (error) {
                        errors.push({
                            code: fieldName,
                            message: error?.message ?? 'Could not upload the file.',
                        });
                    }
                } else {
                    errors.push({
                        code: fieldName,
                        message: `${fileType} proof is required.`,
                    });
                }
            }),
        );

        if (!errors.length) {
            const resAutoKyc = await this.bondsService.autoKyc(
                customer.getConnectionValue(ConnectionType.ICM, 'access_token'),
            );
            console.log('🚀 ~ CustomersService ~ resAutoKyc:', resAutoKyc);

            if (!resAutoKyc.success) {
                errors.push({
                    code: 'CUSTOMER_AUTO_KYC_FAILED',
                    message: resAutoKyc.message,
                });
            } else {
                customer.setConnectionValue(
                    ConnectionType.ICM,
                    'kyc_status',
                    CustomerKycStatus.KYC_VERIFIED,
                );
                await customer.save();
            }
        }

        const resData = {};

        if (!errors.length) {
            resData['success'] = true;
            resData['data'] = new CustomerResDto(customer.toJSON());
            resData['message'] = 'Customer created successfully.';
        } else {
            resData['success'] = false;
            resData['errors'] = errors;
            resData['message'] = 'Could not onboard customer, please check the errors.';
        }

        return resData as ResProps;
    }

    async getCustomer(customer_id: string): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        if (!customer) {
            return {
                success: false,
                message: 'Customer not found.',
            };
        }

        return { success: true, data: customer };
    }

    async updateCustomer(
        customer_id: string,
        session: SessionAccount,
        params: UpdateCustomerReqDto,
        files: Express.Multer.File[],
    ): Promise<ResProps> {
        const customer = await this.customerModel.findOne({ _id: customer_id });

        if (
            customer.getConnectionValue(ConnectionType.ICM, 'kyc_status') ===
            CustomerKycStatus.KYC_VERIFIED
        ) {
            return {
                success: false,
                errors: [
                    {
                        code: 'UPDATE_CUSTOMER_KYC_VERIFIED',
                        message: 'Cannot update a KYC Verified customer, please contact support.',
                    },
                ],
                message: 'Could not update the customer, please check the errors.',
            };
        }

        // TODO - check customers should have zero payments

        const errors = [];

        if (params.pan_number) {
            console.log(
                '🚀 ~ file: customers.service.ts:329 ~ CustomersService ~ session:',
                session,
                params,
            );

            const resGetPanDetails = await this.bondsService.getPanDetails(session.user_api_token, {
                pan_number: params.pan_number,
                birth_date: params.birth_date,
                name: params.name,
            });

            console.log(
                '🚀 ~ CustomersService ~ updateCustomer ~ resGetPanDetails:',
                resGetPanDetails,
            );

            if (resGetPanDetails.success) {
                customer['pan_number'] = params.pan_number;
                customer['name'] = resGetPanDetails.data?.full_name;
            } else {
                errors.push({
                    code: 'UPDATE_CUSTOMER_PAN_NUMBER',
                    message: resGetPanDetails.message,
                });
            }
        }

        // Update customer fields
        Object.entries(params).forEach(([key, value]) => (customer[key] = value));

        const access = await this.bondsService.refreshToken(customer);
        customer.setConnectionValue(ConnectionType.ICM, 'access_token', access.data.token);

        const resUpdateCustomer = await this.bondsService.updateCustomer(customer);
        console.log('🚀 ~ CustomersService ~ resUpdateCustomer:', resUpdateCustomer);

        if (resUpdateCustomer.success) {
            await customer.save();

            // Check if specific fields are updated before saving account details
            // const accountParams: any = {}; // Assuming accountParams is defined in your code

            if (
                params.account_number &&
                params.pan_number &&
                params.account_type &&
                params.ifsc_code
            ) {
                const resSaveAccountDetails = await this.bondsService.updateBankAccount(customer);
                console.log(
                    '🚀 ~ CustomersService ~ resSaveAccountDetails:',
                    resSaveAccountDetails,
                );

                if (!resSaveAccountDetails.success) {
                    errors.push({
                        code: 'UPDATE_CUSTOMER_BANK_ACCOUNT',
                        message: resSaveAccountDetails.message,
                    });
                }
            }
        } else {
            errors.push({
                code: 'UPDATE_CUSTOMER',
                message: resUpdateCustomer['msg'],
            });
        }

        // Uploading attachments
        await Promise.all(
            files.map(async (file) => {
                try {
                    await this.bondsService.uploadPartnerDocs(file, customer);

                    // TODO: Need to refactor with customer_attachments
                    // await this.attachmentService.createAttachment(file, {
                    //     customer_id: customer.id,
                    //     account_id: session.account_id,
                    // });
                } catch (error) {
                    errors.push({
                        code: `UPDATE_CUSTOMER_${AttachmentTypeMap[file.fieldname]}`,
                        message: error?.message ?? 'Could not upload the file.',
                    });
                }
            }),
        );

        const resData = {};

        if (!errors.length) {
            resData['success'] = true;
            resData['data'] = new CustomerResDto(customer.toJSON());
            resData['message'] = 'Customer updated successfully.';
        } else {
            resData['success'] = false;
            resData['errors'] = errors;
            resData['message'] = 'Could not update customer, please check the errors.';
        }

        return resData as ResProps;
    }
}
