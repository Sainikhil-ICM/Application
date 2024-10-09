import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetPanDetailsDto } from './dto/get-pan-details.dto';
import UtilityService from '../utility.service';
import {
    OnboardingFormImagesDto,
    IndividualOnboardingFormDto,
} from './dto/individual-onboarding-form.dto';
import { CustomerDocument } from 'src/models';
import * as fs from 'fs';
import { FileType } from 'src/constants/attachment.const';
import { NonIndividualOnboardingFormDto } from './dto/non-individual-onboarding-form.dto';
import { CustomerProfileType } from 'src/constants/customer.const';

interface DigioRes {
    success: boolean;
    data?: any;
    message?: string;
}

type GetPanDetailsProps = {
    aadhaar_seeding_status: string;
    name_as_per_pan_match: boolean;
    pan: string;
    category: string;
    status: string;
    remarks: string;
    date_of_birth_match: boolean;
};

@Injectable()
export default class DigioService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private utilityService: UtilityService,
    ) {}
    titleize = this.utilityService.titleize;

    digioApiUrl = this.configService.get<string>('DIGIO.API_URL');
    pdfConverterServiceUrl = this.configService.get<string>('PDF_CONVERTER_SERVICE_URL');
    digioClientId = this.configService.get<string>('DIGIO.CLIENT_ID');
    digioClientSecret = this.configService.get<string>('DIGIO.CLIENT_SECRET');
    accessToken = btoa(`${this.digioClientId}:${this.digioClientSecret}`);

    individualAofTemplateKey = this.configService.get<string>(
        'DIGIO.INDIVIDUAL_AOF_TEMPLATE_ID',
    );
    nonIndividualAofTemplateKey = this.configService.get<string>(
        'DIGIO.NON_INDIVIDUAL_AOF_TEMPLATE_ID',
    );

    request = ({ ...options }) => {
        return this.httpService.axiosRef(options).then((res) => res.data);
    };

    async createDocument({
        name,
        email,
        onboardingFromDto,
        onboardingFormImagesDto,
    }: {
        name: string;
        email: string;
        onboardingFromDto?: IndividualOnboardingFormDto;
        onboardingFormImagesDto?: OnboardingFormImagesDto;
    }): Promise<any> {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.digioApiUrl}/v2/client/template/multi_templates/create_sign_request`,
                headers: { authorization: `Basic ${this.accessToken}` },
                data: {
                    signers: [
                        {
                            identifier: email,
                            reason: 'E-KYC',
                            signer_tag: 'Signer 1',
                            name: name,
                            sign_type: 'aadhaar',
                        },
                    ],
                    display_on_page: 'custom',
                    expire_in_days: 10,
                    templates: [
                        {
                            template_key: this.individualAofTemplateKey,
                            images: onboardingFormImagesDto.toJson(),
                            template_values: onboardingFromDto || {},
                        },
                    ],
                    send_sign_link: false,
                    notify_signers: false,
                },
            });
        } catch (error) {
            console.log('🚀 ~ DigioService ~ createDocument ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not create document.',
            );
        }
    }

    async getPanDetails(getPanDetailsDto: GetPanDetailsDto): Promise<GetPanDetailsProps> {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.digioApiUrl}/v3/client/kyc/fetch_id_data/PAN`,
                headers: { authorization: `Basic ${this.accessToken}` },
                data: getPanDetailsDto,
            });
        } catch (error) {
            console.log('🚀 ~ DigioService ~ getPanDetails ~ error:', error);
            throw new ServiceUnavailableException('Could not verify pan details.');
        }
    }

    async prepareOnboardingForm(
        customerProfileType: CustomerProfileType,
        onboardingFromDto: IndividualOnboardingFormDto | NonIndividualOnboardingFormDto,
        onboardingFormImagesDto?: OnboardingFormImagesDto,
    ): Promise<ArrayBuffer> {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.digioApiUrl}/v2/client/template/multi_templates/generate_doc_and_merge`,
                headers: { authorization: `Basic ${this.accessToken}` },
                responseType: 'arraybuffer',
                data: [
                    {
                        template_key:
                            customerProfileType === CustomerProfileType.INDIVIDUAL
                                ? this.individualAofTemplateKey
                                : this.nonIndividualAofTemplateKey,
                        template_values: onboardingFromDto,
                        images: onboardingFormImagesDto ? onboardingFormImagesDto.toJson() : {},
                    },
                ],
            });
        } catch (error) {
            console.log('🚀 ~ DigioService ~ prepareOnboardingForm ~ error:', error);
            throw new ServiceUnavailableException(
                'Service unavailable, could not prepare onboarding form.',
            );
        }
    }

    async digilockerCreateRequest(customer: CustomerDocument) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.digioApiUrl}/client/kyc/v2/request/with_template`,
                headers: { authorization: `Basic ${this.accessToken}` },
                data: {
                    customer_identifier: customer.email,
                    customer_name: customer.name,
                    template_name: 'OBONBOARDING',
                    notify_customer: false,
                    request_details: {
                        pan: customer.pan_number,
                    },
                },
            });
        } catch (e) {
            console.error(e);
            throw new ServiceUnavailableException(
                'Service unavailable, could not start digilocker request.',
            );
        }
    }

    async refreshToken(entity_id: string) {
        try {
            return await this.request({
                method: 'POST',
                url: `${this.digioApiUrl}/user/auth/generate_token`,
                headers: { authorization: `Basic ${this.accessToken}` },
                data: {
                    entity_id,
                },
            });
        } catch (e) {
            console.error(e);
            throw new ServiceUnavailableException(
                'Service unavailable, could not start digilocker request.',
            );
        }
    }

    async getKycResponse(entity_id: string) {
        try {
            const kycResponse = await this.request({
                method: 'POST',
                url: `${this.digioApiUrl}/client/kyc/v2/${entity_id}/response`,
                headers: { authorization: `Basic ${this.accessToken}` },
                data: {},
            });

            console.log(`🚀 ~ getKycResponse ~ kycResponse`, kycResponse);
            const aadhaarDetails = kycResponse.actions?.[0]?.details?.aadhaar;
            const panDetails = kycResponse.actions?.[0]?.details?.pan;
            const requestId = kycResponse.actions?.[0]?.execution_request_id;

            const aadhaarPdf = await this.request({
                method: 'GET',
                url: `${this.digioApiUrl}/client/kyc/v2/media/${requestId}?doc_type=AADHAAR`,
                headers: {
                    authorization: `Basic ${this.accessToken}`,
                },
                responseType: 'arraybuffer',
            });
            const panPdf = await this.request({
                method: 'GET',
                url: `${this.digioApiUrl}/client/kyc/v2/media/${requestId}?doc_type=PAN`,
                headers: {
                    authorization: `Basic ${this.accessToken}`,
                },
                responseType: 'arraybuffer',
            });
            const aadhaarPdfBuffer = Buffer.from(aadhaarPdf);
            const panPdfBuffer = Buffer.from(panPdf);

            let formData = new FormData();
            formData.append('pdf', new Blob([aadhaarPdfBuffer], { type: 'application/pdf' }));
            const aadhaarImageBase64 = await this.request({
                method: 'POST',
                url: `${this.pdfConverterServiceUrl}/v1/customers/convert-pdf-to-image`,
                data: formData,
            });

            formData = new FormData();
            formData.append('pdf', new Blob([panPdfBuffer], { type: 'application/pdf' }));
            const panImageBase64 = await this.request({
                method: 'POST',
                url: `${this.pdfConverterServiceUrl}/v1/customers/convert-pdf-to-image`,
                data: formData,
            });

            const aadhaarImage = Buffer.from(aadhaarImageBase64, 'base64');
            const panImage = Buffer.from(panImageBase64, 'base64');

            return {
                aadhaarDetails,
                panDetails,
                aadhaarImage,
                panImage,
            };
        } catch (e) {
            console.error(e);
            throw new ServiceUnavailableException(
                'Service unavailable, could not start digilocker request.',
            );
        }
    }

    async getSignedForm(entity_id: string) {
        try {
            return await this.request({
                method: 'GET',
                url: `${this.digioApiUrl}/v2/client/document/download?document_id=${entity_id}`,
                headers: { authorization: `Basic ${this.accessToken}` },
                responseType: 'arraybuffer',
            });
        } catch (e) {
            console.error(e);
            throw new ServiceUnavailableException(
                'Service unavailable, could not start digilocker request.',
            );
        }
    }
}
