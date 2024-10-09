import { v4 as uuid } from 'uuid';
import { ObjectId, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

import { LoginCustomerDto } from './dto/login-customer.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
    AddNomineesDto,
    SubmitSignedFormDto,
    ThirdPartyCustomerDto,
    UploadChequeDto,
    ValidatePanDto,
    VerifyBankDto,
} from './dto/kyc.dto';
import {
    IndividualOnboardingFormDto,
    OnboardingFormImagesDto,
} from 'src/services/digio/dto/individual-onboarding-form.dto';
import { SubmitFullKycDataDto } from 'src/services/hyper-verge/dto/bonds-hyper-verge.dto';

import { CreateCustomerDmo } from 'src/services/onboarding/dmo/create-customer.dmo';

import { Connection, ConnectionType, CustomerDocument, TempCustomerDocument } from 'src/models';

import {
    AddressProofType,
    AkycErrorPanValidation,
    B2CCustomerAttachmentMap,
    CustomerKycStatus,
    Gender,
    KycMode,
    SessionCustomer,
} from 'src/constants/customer.const';
import { FileType } from 'src/constants/attachment.const';

import Msg91Service from 'src/services/msg91.service';
import HyperVergeService from 'src/services/hyper-verge/hyper-verge.service';
import OnboardingService from 'src/services/onboarding/onboarding.service';
import AttachmentService from 'src/services/attachment.service';
import DigioService from 'src/services/digio/digio.service';
import UtilityService from 'src/services/utility.service';
import BondsHyperVergeService from 'src/services/hyper-verge/bonds-hyper-verge.service';
import BondsService from 'src/services/bonds.service';
import UploadService from 'src/services/upload.service';

import { CustomersRepository } from './customers.repository';

type ConnectionAttributes = {
    connectionField: keyof Connection;
    customerField: string;
}[];

@Injectable()
export class CustomersService {
    constructor(
        private readonly msg91Service: Msg91Service,
        private readonly jwtService: JwtService,
        private readonly hyperVergeService: HyperVergeService,
        private readonly onboardingService: OnboardingService,
        private readonly attachmentService: AttachmentService,
        private readonly customersRepository: CustomersRepository,
        private readonly digioService: DigioService,
        private readonly utilityService: UtilityService,
        private readonly bondsHyperVergeService: BondsHyperVergeService,
        private readonly bondsService: BondsService,
        private readonly uploadService: UploadService,
    ) {}

    private account_code = 'ICMP999'; // TODO: remove this.

    private connectionAttributes: ConnectionAttributes = [
        { connectionField: 'access_token', customerField: 'access_token' },
        { connectionField: 'refresh_token', customerField: 'api_token' },
        {
            connectionField: 'access_token_expires_at',
            customerField: 'access_token_expires_at',
        },
        { connectionField: 'foreign_id', customerField: 'foreign_id' },
    ];

    private incomeCategoryMap = {
        LT_1_LAKH: '1',
        '1_5_LAKH': '2',
        '5_10_LAKH': '3',
        '10_25_LAKH': '4',
        GT_25_LAKH: '5',
    };

    private updateConnectionsValue(
        customer: CustomerDocument,
        connectionName: ConnectionType,
        updates: Partial<Record<keyof Connection, any>>,
    ): void {
        let connections = customer.connections || [];
        const relevantConnectionIndex = connections.findIndex(
            (connection) => connection.type === connectionName,
        );

        if (relevantConnectionIndex === -1)
            connections = [
                ...connections,
                {
                    type: connectionName,
                    ...updates,
                },
            ];
        else {
            connections = customer.connections.map((connection, index) =>
                index === relevantConnectionIndex ? { ...connection, ...updates } : connection,
            );
        }
    }

    private async getOneTimePassword(): Promise<any> {
        const token = Math.random().toString().substring(4, 8);
        const secret = await bcrypt.hash(token, 10);

        console.log('🚀 ~ Login Token', token, secret);
        return { token, secret };
    }

    private async sendPhoneOtp(phone_number: string): Promise<string> {
        const { token, secret } = await this.getOneTimePassword();

        // Sending OTP to the phone number.
        await this.msg91Service.sendMessage(`91${phone_number}`, token);

        return secret;
    }

    private hasOtpExpired(otpExpiriesAt: Date): boolean {
        if (!otpExpiriesAt) {
            return true;
        }

        const dateNow = new Date();
        const hasExpired = otpExpiriesAt.getTime() - dateNow.getTime() < 0;
        return hasExpired;
    }

    private async isOtpValid(
        otp: string,
        customer: CustomerDocument | TempCustomerDocument,
    ): Promise<boolean> {
        return await bcrypt.compare(otp, customer.phone_secret);
    }

    private isTestingNumber(phone: string) {
        const numPattern = '10001';
        return phone.startsWith(numPattern);
    }

    async loginCustomer({ phone_number }: LoginCustomerDto) {
        // Check if it is a testing number.
        if (this.isTestingNumber(phone_number)) {
            return this.testLogin({ phone_number });
        }

        // check if customer exists
        const customer = await this.customersRepository.findCustomer({ phone_number });
        const otpExpiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes

        if (!customer) {
            // Find or create tempCustomer.
            const tempCustomer = await this.customersRepository
                // Keeping the code in multiple lines.
                .findTempCustomer({ phone_number }, { upsert: true, new: true });

            // Sending OTP to the phone number.
            const secret = await this.sendPhoneOtp(phone_number);

            // Update doc and save.
            this.customersRepository.updateTempCustomer(
                { _id: tempCustomer._id },
                {
                    phone_secret: secret,
                    phone_secret_expires_at: otpExpiryTime,
                },
            );
        } else {
            // Sending OTP to the phone number.
            const secret = await this.sendPhoneOtp(phone_number);

            // Update doc and save.
            this.customersRepository.updateCustomer(
                { _id: customer._id },
                {
                    phone_secret: secret,
                    phone_secret_expires_at: otpExpiryTime,
                },
            );
        }

        return {
            success: true,
            message: `One time password sent to ${phone_number}`,
        };
    }

    async verifyOtp({ phone_number, otp }: VerifyOtpDto) {
        const customer = await this.customersRepository.findCustomer({ phone_number });
        let isOtpValid = false;

        if (!customer) {
            const tempCustomer = await this.customersRepository.findTempCustomer({ phone_number });

            // Check if otp has expired.
            const hasOtpExpired = this.hasOtpExpired(tempCustomer.phone_secret_expires_at);
            if (hasOtpExpired) {
                return {
                    success: false,
                    message: 'You have entered an expired OTP, please try again.',
                };
            }

            // Check if otp is valid.
            isOtpValid = await this.isOtpValid(otp, tempCustomer);
            if (!isOtpValid) {
                return {
                    success: false,
                    message: 'You have entered an incorrect OTP, please try again.',
                };
            }

            await this.customersRepository.updateTempCustomer(
                { _id: tempCustomer._id },
                { is_phone_verified: true },
            );

            return {
                success: true,
                message: 'Phone has been verified, proceed to sign up.',
            };
        }

        // Check if otp has expired.
        const hasOtpExpired = this.hasOtpExpired(customer.phone_secret_expires_at);
        if (hasOtpExpired) {
            return {
                success: false,
                message: 'You have entered an expired OTP, please try again.',
            };
        }

        // Check if otp is valid.
        isOtpValid = await this.isOtpValid(otp, customer);
        if (!isOtpValid) {
            return {
                success: false,
                message: 'You have entered an incorrect or expired OTP, please try again.',
            };
        }

        // Generate a jwt token
        const accessToken = await this.jwtService
            // Keeping the code in multiple lines.
            .signAsync({ sub: 'CUSTOMER_LOGIN', customer_id: customer._id });

        // Update doc and save
        this.customersRepository.updateCustomer(
            { _id: customer._id },
            {
                access_token: accessToken,
                is_phone_verified: true,
            },
        );

        return {
            success: true,
            data: { access_token: accessToken },
        };
    }

    async createCustomer(createCustomerDto: CreateCustomerDto) {
        const { phone_number, pan_number, email } = createCustomerDto;
        // Check if customer already exists
        const customer = await this.customersRepository
            // Keeping the code in multiple lines.
            .findCustomer({ $or: [{ phone_number }, { pan_number }, { email }] });

        if (customer) {
            // Return appropriate error message.
            let message = 'A customer already exists with this phone number.';
            if (customer.pan_number === pan_number) {
                message = 'A customer already exists with this pan.';
            } else if (customer.email === email) {
                message = 'A customer already exists with this email.';
            }

            return {
                success: false,
                message,
            };
        }

        const tempCustomer = await this.customersRepository
            // Keeping the code in multiple lines.
            .findTempCustomer({ phone_number: createCustomerDto.phone_number });

        if (!tempCustomer || !tempCustomer.is_phone_verified) {
            return {
                success: false,
                message: 'Phone number not verified, please verify phone number first.',
            };
        }

        // Generate a jwt token
        const customerId = new Types.ObjectId();
        const accessToken = await this.jwtService
            // Keeping the code in multiple lines.
            .signAsync({ sub: 'CUSTOMER_LOGIN', customer_id: customerId });

        // Create a new customer
        const newCustomer = await this.customersRepository.createCustomer({
            ...createCustomerDto,
            _id: customerId,
            access_token: accessToken,
            phone_secret: tempCustomer.phone_secret,
            phone_secret_expires_at: tempCustomer.phone_secret_expires_at,
        });

        if (newCustomer) {
            await this.customersRepository
                // Keeping the code in multiple lines.
                .deleteTempCustomer({ phone_number: createCustomerDto.phone_number });
        }

        return {
            success: true,
            data: { access_token: newCustomer.access_token },
        };
    }

    async resendOTP({ phone_number }: LoginCustomerDto) {
        // Check if customer exists
        const customer = await this.customersRepository.findCustomer({ phone_number });

        if (!customer) {
            const tempCustomer = await this.customersRepository.findTempCustomer({ phone_number });

            if (!tempCustomer) {
                return {
                    success: false,
                    message: `Customer not found for phone number: ${phone_number}`,
                };
            }

            const secret = await this.sendPhoneOtp(phone_number);
            const otpExpiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes

            this.customersRepository.updateTempCustomer(
                { _id: tempCustomer._id },
                { phone_secret: secret, phone_secret_expires_at: otpExpiryTime },
            );

            return {
                success: true,
                message: 'OTP has been resent to the phone number.',
            };
        }

        const secret = await this.sendPhoneOtp(phone_number);
        const otpExpiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes

        // Update doc and save
        this.customersRepository.updateCustomer(
            { _id: customer._id },
            {
                phone_secret: secret,
                phone_secret_expires_at: otpExpiryTime,
            },
        );

        return {
            success: true,
            message: 'OTP has been resent to the phone number.',
        };
    }

    async testLogin({ phone_number }: LoginCustomerDto) {
        // Check if customer exists.
        const customer = await this.customersRepository.findCustomer({ phone_number });
        const otpExpiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes
        const token = phone_number.slice(-4);
        const secret = await bcrypt.hash(token, 10);

        if (customer) {
            await this.customersRepository.updateCustomer(
                { _id: customer._id },
                { phone_secret: secret, phone_secret_expires_at: otpExpiryTime },
            );
            return { success: true, message: `One time password sent to ${phone_number}` };
        }

        // Check if temp customer exists otherwise create a new one.
        const tempCustomer = await this.customersRepository.findTempCustomer(
            { phone_number },
            { upsert: true, new: true },
        );
        await this.customersRepository.updateTempCustomer(
            { _id: tempCustomer._id },
            { phone_secret: secret, phone_secret_expires_at: otpExpiryTime },
        );

        return { success: true, message: `One time password sent to ${phone_number}` };
    }

    async updateCustomer(customerId: ObjectId, updateCustomerDto: UpdateCustomerDto) {
        const updatedCustomer = await this.customersRepository.updateCustomer(
            { _id: customerId },
            updateCustomerDto,
        );

        if (updatedCustomer.modifiedCount === 0) {
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

    async getAdvisors(customerId: ObjectId) {
        // Get all advisors for the customer.
        const advisors = await this.customersRepository.findUsersForCustomer(customerId);

        if (!advisors.length) {
            return {
                success: false,
                message: 'No advisors are assigned for this customer.',
            };
        }

        return { success: true, message: 'Advisors found successfully.', data: { advisors } };
    }

    async validatePan(session: SessionCustomer, validatePanDto: ValidatePanDto) {
        const { customer_id } = session;

        const customer = await this.customersRepository
            // Fetch customer details.
            .findCustomerById(customer_id);

        const customerProfile = await this.customersRepository
            // Check if customer profile exists.
            .findCustomerProfile({
                _id: customer_id,
            });
        if (customerProfile?.all_details_filled) {
            return {
                success: false,
                error: AkycErrorPanValidation.PAN_EXISTS,
            };
        }

        const panVerificationResponse = await this.hyperVergeService
            // Verify pan through hyperverge.
            .verifyPan(validatePanDto);

        if (!panVerificationResponse.success) return panVerificationResponse;

        const amlCheckResponse = await this.hyperVergeService
            // Check for aml blacklisting.
            .amlCheck(validatePanDto);

        if (!amlCheckResponse.success) return amlCheckResponse;
        const amlHits = amlCheckResponse?.data?.hits;

        const resCreateCustomerIcm = await this.onboardingService
            // Create a customer on ICM.
            .createCustomer(
                new CreateCustomerDmo({
                    ...validatePanDto,
                    account_code: this.account_code,
                    connection_type: ConnectionType.ICM,
                }),
            );

        if (!resCreateCustomerIcm.success)
            return {
                success: false,
                message: resCreateCustomerIcm.message,
            };

        const resCreateCustomerBidd = await this.onboardingService
            // Create a customer on BIDD.
            .createCustomer(
                new CreateCustomerDmo({
                    ...validatePanDto,
                    account_code: this.account_code,
                    connection_type: ConnectionType.BIDD,
                }),
            );

        if (!resCreateCustomerBidd.success) {
            return {
                success: false,
                message: resCreateCustomerBidd.message,
            };
        }

        await this.customersRepository
            // Create a customer-profile.
            .upsertCustomerProfile(customer_id, {
                customer_id: customer_id,
                aml_hits: amlHits,
                ...validatePanDto,
            });

        // Udpate ICM connection values.
        const icmUpdates = {};
        this.connectionAttributes.forEach(
            ({ connectionField, customerField }) =>
                (icmUpdates[connectionField] = resCreateCustomerIcm.data[customerField]),
        );
        this.updateConnectionsValue(customer, ConnectionType.ICM, icmUpdates);

        // Udpate BIDD connection values.
        const biddUpdates = {};
        this.connectionAttributes.forEach(
            ({ connectionField, customerField }) =>
                (biddUpdates[connectionField] = resCreateCustomerIcm.data[customerField]),
        );
        this.updateConnectionsValue(customer, ConnectionType.BIDD, biddUpdates);

        const ckycSearchResponse = await this.hyperVergeService.ckycSearch(validatePanDto);
        await this.customersRepository
            // Update customer profile with ckycNo.
            .upsertKycCustomerProfile({
                customer_id: customer_id,
                pan_number: validatePanDto.pan_number,
                transaction_id: validatePanDto.transactionId,
                birth_date: validatePanDto.birth_date,
                name: validatePanDto.name,
                ckyc_number: ckycSearchResponse.result.ckycNo,
                aml_hits: amlHits,
                review_required: amlHits?.length > 0,
            });

        await this.customersRepository
            // Update customer doc.
            .updateCustomer(
                { _id: customer_id },
                {
                    ...validatePanDto,
                    kyc_mode: KycMode.DIGILOCKER,
                    connections: customer.connections,
                },
            );
        return { success: true, message: 'Pan validated successfully.' };
    }

    async verifyBankAccount(verifyBankDto: VerifyBankDto) {
        const response = await this.hyperVergeService
            // Penny drop verification for bank account.
            .pennyDropVerification(verifyBankDto);

        if (!response.success) {
            return {
                success: false,
                message: 'Failed to verify bank account',
                error: response.error,
            };
        }

        await this.customersRepository
            // Update customer-profile details.
            .upsertKycCustomerProfile({
                pan_number: verifyBankDto.pan_number,
                transaction_id: verifyBankDto.transactionId,
                bank_account: {
                    number: verifyBankDto.bank_account.number,
                    type: verifyBankDto.bank_account.type,
                    ifsc_code: verifyBankDto.bank_account.ifsc,
                    name: response.data.result.accountName,
                    verified: true,
                    demat_account_number: verifyBankDto.bank_account.demat_account_number,
                },
                marital_status: verifyBankDto.marital_status,
                gender: verifyBankDto.gender,
                occupation: verifyBankDto.occupation,
                fathers_name: verifyBankDto.fathers_name,
                citizenship: verifyBankDto.citizenship,
                residential_status: verifyBankDto.residential_status,
            });

        return {
            success: true,
            message: 'Bank account verified successfully',
            data: response.data,
        };
    }

    async uploadFile(session: SessionCustomer, file: Express.Multer.File) {
        const attachment = await this.attachmentService.createCustomerAttachment(file, {
            customer_id: session.customer_id.toString(),
        });

        return {
            success: true,
            message: 'File uploaded successfully.',
            data: {
                link: attachment.location,
            },
        };
    }

    async uploadCancelledCheque(uploadChequeDto: UploadChequeDto) {
        const cancelledChequeScanResponse = await this.hyperVergeService
            // Get bank details from the image.
            .cancelledChequeVerification(uploadChequeDto);

        if (
            uploadChequeDto.bank_account.number !== cancelledChequeScanResponse.data?.account_number
        ) {
            return {
                success: false,
                error: `Account number does not match with the cancelled cheque`,
            };
        } else if (
            uploadChequeDto.bank_account.ifsc !== cancelledChequeScanResponse.data?.ifsc_code
        ) {
            return {
                success: false,
                error: `IFSC does not match with the cancelled cheque`,
            };
        }

        return {
            success: true,
            data: cancelledChequeScanResponse.data,
            message: 'Cheque uploaded successfully.',
        };
    }

    async addNominees(session: SessionCustomer, addNomineesDto: AddNomineesDto) {
        const { customer_id } = session;

        const updatedProfile = await this.customersRepository
            // Update customer profile with nominee details.
            .upsertCustomerProfile(customer_id, {
                nominees: addNomineesDto.nominees
                    ? addNomineesDto.nominees.map((nominee) => ({
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
            });

        if (!updatedProfile) {
            return {
                success: false,
                message: 'Could not add nominees, please try again.',
            };
        }

        return {
            success: true,
            message: 'Nominees added successfully.',
        };
    }

    async processDigilockerRequest(session: SessionCustomer, reset: boolean) {
        const { customer_id } = session;

        const customer = await this.customersRepository
            // Fetch customer details.
            .findCustomerById(customer_id);

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
                // Check if token is still valid.
                return {
                    success: true,
                    data: customer.digilocker_request_token,
                };
            } else if (customer.digilocker_request_token?.doc_id) {
                const newToken = await this.digioService
                    // Refresh digilocker token.
                    .refreshToken(customer.digilocker_request_token.doc_id);

                const updatedCustomer = await this.customersRepository
                    // Update customer details.
                    .updateCustomerById(
                        customer_id,
                        {
                            doc_id: customer.digilocker_request_token.doc_id,
                            token: newToken.id,
                            valid_till: newToken.valid_till,
                        },
                        { new: true },
                    );

                return {
                    success: true,
                    data: updatedCustomer.digilocker_request_token,
                };
            }
        }

        const digilockerCreateRequestResponse = await this.digioService
            // Create digilocker request (with template).
            .digilockerCreateRequest(customer);

        const {
            entity_id: doc_id,
            id: token,
            valid_till,
        } = digilockerCreateRequestResponse.access_token;

        const updatedCustomer = await this.customersRepository
            // Update customer details.
            .updateCustomerById(
                customer_id,
                {
                    digilocker_request_token: {
                        doc_id,
                        token,
                        valid_till,
                    },
                },
                { new: true },
            );

        return {
            success: true,
            data: updatedCustomer.digilocker_request_token,
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

    async getDigilockerData(session: SessionCustomer) {
        const { customer_id } = session;

        const customer = await this.customersRepository
            // Fetch customer details.
            .findCustomerById(customer_id);

        if (!customer) {
            return {
                success: false,
                error: 'Customer not found',
                message: 'Customer not found',
            };
        }

        const customerProfile = await this.customersRepository
            // Fetch customer profile details.
            .findCustomerProfile({ customer_id });

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

        const { aadhaarDetails, panDetails, aadhaarImage, panImage } = await this.digioService
            // Get customer details from digilocker.
            .getKycResponse(customer.digilocker_request_token?.doc_id);

        if (panDetails.id_number.toLowerCase() !== customer.pan_number.toLowerCase()) {
            return {
                success: false,
                error: 'Aadhaar details do not match with the PAN entered by your relationship manager',
                message:
                    'Aadhaar details do not match with the PAN entered by your relationship manager',
            };
        }

        const aadhaarUrl = await this
            // Save customers Aadhaar.
            .uploadFileFromBuffer(aadhaarImage, customer_id.toString(), 'ADDRESS');
        const panUrl = await this.uploadFileFromBuffer(panImage, customer_id.toString(), 'PAN');

        await this.customersRepository
            // Update customer profile.
            .upsertCustomerProfile(customer_id, {
                correspondance_address: {
                    ...customerProfile.correspondance_address,
                    line_1: aadhaarDetails.current_address_details.address,
                    line_2: aadhaarDetails.current_address_details.locality_or_post_office,
                    city: aadhaarDetails.current_address_details.district_or_city,
                    state: aadhaarDetails.current_address_details.state,
                    pin_code: aadhaarDetails.current_address_details.pincode,
                    country: 'India',
                },
                aadhaar_details: aadhaarDetails,
                pan_details: panDetails,
                documents: {
                    poa_type: AddressProofType.AADHAAR,
                    poa_document: aadhaarUrl,
                    pan_document: panUrl,
                },
            });

        return {
            success: true,
            data: {
                aadhaarDetails,
                panDetails,
            },
        };
    }

    async validateSelfie(
        session: SessionCustomer,
        transactionId: string,
        files: Express.Multer.File[],
    ) {
        const customer_id = session.customer_id.toString();

        const customerProfile = await this.customersRepository
            // Fetch Customer profile details.
            .findCustomerProfile({
                customer_id: customer_id,
            });

        const getIdCardResponse = await axios
            // Fetch customer's selfie from s3.
            .get(customerProfile.documents.poa_document, {
                responseType: 'arraybuffer',
            });
        const idCard = Buffer.from(getIdCardResponse.data, 'binary');

        const selfie = files[0];
        const selfieValidationResponse = await this.hyperVergeService
            // Validate selfie using hyperverge service.
            .selfieVerification({ customer_id, transaction_id: transactionId }, selfie, idCard);

        if (selfieValidationResponse.success) {
            const selfieUrl = await this
                // Get hosted url for the image.
                .uploadFileFromBuffer(selfie.buffer, customer_id, 'selfie');

            await this.customersRepository
                // Update Customer profile.
                .upsertCustomerProfile(session.customer_id, {
                    documents: {
                        ...customerProfile.documents,
                        photo: selfieUrl,
                    },
                });
        }

        return selfieValidationResponse;
    }

    async validateSignature(
        session: SessionCustomer,
        transactionId: string,
        files: Express.Multer.File[],
    ) {
        const customer_id = session.customer_id.toString();
        const signature = files[0];

        const signatureValidationResponse = await this.hyperVergeService
            // Verify signature using hyperverge.
            .signatureVerification({ customer_id, transaction_id: transactionId }, signature);

        if (signatureValidationResponse.success) {
            const signatureUrl = await this
                // Save signature image.
                .uploadFileFromBuffer(signature.buffer, customer_id, 'SIGNATURE');

            const customerProfile = await this.customersRepository
                // Fetch customer profile details.
                .findCustomerProfile({
                    customer_id,
                });

            await this.customersRepository
                // Update signature url in customer profile.
                .upsertCustomerProfile(session.customer_id, {
                    documents: {
                        ...customerProfile.documents,
                        signature: signatureUrl,
                    },
                });
        }

        return signatureValidationResponse;
    }

    async getEsignDocumentId(session: SessionCustomer) {
        const { customer_id } = session;

        const customer = await this.customersRepository
            // Fetch customer details.
            .findCustomerById(customer_id);

        const customerProfile = await this.customersRepository
            // Fetch customer profile details.
            .findCustomerProfile({ customer_id });

        let docId = customer.aof_digio_doc_id;
        if (!docId) {
            const onboardingFromDto = new IndividualOnboardingFormDto({
                ...customerProfile,
                date: new Date().toDateString(),
            });

            // Get Base64 for all, customer kyc related documents.
            const onboardingFormImagesDto = new OnboardingFormImagesDto(customerProfile);
            await onboardingFormImagesDto.resolveImages(this.utilityService.imageUrlToBase64);

            const resCreateDocument = await this.digioService
                // Create onboarding-form template using digio.
                .createDocument({
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

            docId = resCreateDocument.id;

            await this.customersRepository.updateCustomerById(customer_id, {
                aof_digio_doc_id: docId,
            });
        }

        return {
            success: true,
            data: {
                email: customer.email,
                digio_doc_id: docId,
            },
        };
    }

    async sendCustomerDocsToAdmin(customer_id: ObjectId) {
        const customer = await this.customersRepository
            // Fetch customer details.
            .findCustomerById(customer_id);

        const attachments = await this.attachmentService
            // Fetch customer attachment urls.
            .getCustomerAttachments(customer_id.toString());

        // Upload all customer docs on ICM admin.
        const uploadPromises = attachments
            .filter((attachment) => Object.keys(B2CCustomerAttachmentMap).includes(attachment.type))
            .map(async (attachment) => {
                try {
                    const fileStream = await this.uploadService.downloadFile(attachment.link);

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

    async submitSignedForm(submitSignedFormDto: SubmitSignedFormDto) {
        const { signed_form_link, customer_id } = submitSignedFormDto;

        const customerProfile = await this.customersRepository
            // Update form url in customer profile.
            .upsertCustomerProfile(customer_id, {
                signed_form_link,
            });

        const customer = await this.customersRepository
            // Fetch customer details.
            .findCustomerById(customer_id);

        // Update customer kyc status.
        this.updateConnectionsValue(customer, ConnectionType.BIDD, {
            kyc_status: CustomerKycStatus.KYC_SUBMITTED,
        });

        // Push kyc data to B2C.
        const data = new SubmitFullKycDataDto(customerProfile);

        const customerConnections = customer.connections;
        const biddConnection = customerConnections.find(({ type }) => type === ConnectionType.BIDD);

        const response = await this.bondsHyperVergeService
            // Push data to BIDD.
            .submitFullKycData(biddConnection.access_token, data);

        // Upload customer docs on ICM admin.
        await this.sendCustomerDocsToAdmin(customer.id);

        const icmConnection = customerConnections.find(({ type }) => type === ConnectionType.ICM);

        await this.bondsService
            // Push data to ICM.
            .updateThirdPartyData(icmConnection.access_token, {
                name: customer.name,
                pan: customer.pan_number,
                gender: customer.gender == Gender.MALE ? 'M' : 'F',
                income: this.incomeCategoryMap[customerProfile.income_range],
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
            } as ThirdPartyCustomerDto);

        this.updateConnectionsValue(customer, ConnectionType.ICM, {
            kyc_status: CustomerKycStatus.KYC_SUBMITTED,
        });

        await this.customersRepository
            // Update customer connections details.
            .updateCustomer({ _id: customer_id }, { connections: customer.connections });

        console.log('B2C KYC Submit response', response);
        return {
            success: true,
            data: {
                ...customerProfile,
            },
        };
    }

    async submitFinalForm(session: SessionCustomer) {
        const { customer_id } = session;

        const customer = await this.customersRepository
            // Fetch customer details.
            .findCustomerById(customer_id);

        const signedForm = await this.digioService
            // Fetch signed form details from digio.
            .getSignedForm(customer.aof_digio_doc_id);

        // Save form in cloud.
        const signedFormUrl = await this.uploadFileFromBuffer(
            Buffer.from(signedForm),
            customer_id.toString(),
            'signed_form',
            true,
        );

        // Submit the final form.
        await this.submitSignedForm({
            customer_id,
            signed_form_link: signedFormUrl,
        });

        return {
            success: true,
        };
    }
}
