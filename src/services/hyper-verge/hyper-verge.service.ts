import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { format } from 'date-fns';
import {
    AkycSubmitCustomerProfileDto,
    AkycValidateSelfieDto,
    AkycVerifyBankAccountDto,
    AkycVerifyCancelledChequeDto,
    AkycVerifyPanDto,
} from 'src/app/backend/customers/dto/akyc.dto';
import { CheckLocationDto } from 'src/app/backend/customers/dto/check-location.dto';
import { AkycErrorPanValidation, CustomerProfileStatus } from 'src/constants/customer.const';

@Injectable()
export default class HyperVergeService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    hvCreds = {
        appId: this.configService.get<string>('HYPER_VERGE_APP_ID'),
        appKey: this.configService.get<string>('HYPER_VERGE_APP_KEY'),
    };

    // Docs: https://documentation.hyperverge.co/api-reference/india_api/PAN%20Utility%20APIs/nsdl_pan_verification
    async verifyPan(body: AkycVerifyPanDto) {
        const res = await this.request(
            {
                url: `https://ind-thomas.hyperverge.co/v1/NSDLPanVerification`,
                data: {
                    pan: body.pan_number,
                    dateOfBirth: format(new Date(body.birth_date), 'dd-MM-yyyy'),
                    nameOnCard: body.name,
                },
            },
            body.transactionId,
        );
        if (!res.success) {
            if (res.statusCode === 404) {
                return {
                    success: false,
                    data: {
                        profileStatus: CustomerProfileStatus.PAN_VERIFICATION_FAILED,
                    },
                    error: AkycErrorPanValidation.INVALID_PAN,
                };
            }
            return res;
        }

        const checks = {
            [AkycErrorPanValidation.INVALID_PAN]: (data) => data.panStatus !== 'EXISTING AND VALID',
            [AkycErrorPanValidation.NAME_MISMATCH]: (data) => data.name !== 'MATCHING',
            [AkycErrorPanValidation.BIRTH_DATE_MISMATCH]: (data) => data.dateOfBirth !== 'MATCHING',
        };

        for (const error in checks) {
            if (checks[error](res.response.result))
                return {
                    success: false,
                    error,
                    data: {
                        profileStatus: CustomerProfileStatus.PAN_VERIFICATION_FAILED,
                    },
                };
        }

        return {
            success: true,
            message: 'PAN details verified successfully',
            data: {
                profileStatus: CustomerProfileStatus.DETAILS_PENDING,
            },
        };
    }

    async amlCheck(body: AkycVerifyPanDto) {
        const res = await this.request(
            {
                url: `https://ind.thomas.hyperverge.co/v1/amlSearch`,
                data: {
                    dob: format(new Date(body.birth_date), 'dd-MM-yyyy'),
                    name: body.name,
                },
            },
            body.transactionId,
        );

        if (!res.success)
            return {
                ...res,
                data: {
                    ...res.response,
                },
            };

        if (res.response.result.hits.length !== 0)
            return {
                success: true,
                data: {
                    hits: res.response.result.hits,
                },
            };

        return {
            success: true,
            message: 'AML verification successful',
            data: {},
        };
    }

    async ckycSearch(body: AkycVerifyPanDto) {
        const res = await this.request(
            {
                url: `https://ind-ckyc.hyperverge.co/api/v1/searchAndDownload`,
                data: {
                    idType: 'C',
                    idNo: body.pan_number,
                    entityType: 'individual',
                    returnOnlySearchResponse: 'yes',
                },
            },
            body.transactionId,
        );

        return {
            success: res.success,
            result: res.response.result || {},
        };
    }

    async pennyDropVerification(body: AkycSubmitCustomerProfileDto) {
        const { bank_account, name } = body;

        const res = await this.request(
            {
                url: 'https://ind-verify.hyperverge.co/api/checkBankAccount',
                data: {
                    ifsc: bank_account.ifsc,
                    accountNumber: bank_account.number,
                },
            },
            body.transactionId,
        );

        if (res.response.result?.bankResponse !== 'Transaction Successful') {
            const error = res.response.result?.bankResponse || res.response?.error;

            return {
                success: false,
                error,
                data: res.response || {},
            };
        }

        const bankAccountName = res.response.result?.accountName as string;

        if (bankAccountName.toLowerCase() !== name.toLowerCase()) {
            return {
                success: false,
                error: 'Failed to match bank account name with the provided customer name',
                data: res.response || {},
            };
        }

        return {
            success: true,
            message: 'Bank account verified successfully',
            data: res.response,
        };
    }

    async cancelledChequeVerification(body: AkycSubmitCustomerProfileDto) {
        const response = await fetch(body.cancelled_cheque);

        if (!response.ok) {
            return {
                success: false,
                error: 'Invalid cancelled cheque image',
            };
        }

        const blob = await response.blob();

        const fileName = body.cancelled_cheque.split('/').pop(); // Extract file name from URL

        const formData = new FormData();

        formData.append('image', blob, fileName);

        try {
            const res = await this.request(
                {
                    url: 'https://ind.thomas.hyperverge.co/v1/readCheque',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
                body.transactionId,
            );

            if (!res.success) {
                return {
                    success: false,
                    error:
                        res.response?.error ||
                        'An unknown error occured while processing the image.',
                };
            }

            const result = res?.response?.result;
            const hvChequeScanData = result?.[0]?.['details'];

            if (!hvChequeScanData) {
                return {
                    success: false,
                    error: 'Failed to read cancelled cheque data',
                };
            }

            const chequeDataResponse = {};

            for (const dataField of ['account_number', 'ifsc_code']) {
                if (hvChequeScanData[dataField]['to-be-reviewed'] !== 'no') {
                    console.log(
                        'low confidence cancelled cheque scan',
                        JSON.stringify(hvChequeScanData),
                    );
                    return {
                        success: false,
                        error: 'Unclear cancelled cheque photo; manual review required', // TODO: improve this message?
                    };
                }
                chequeDataResponse[dataField] = hvChequeScanData[dataField]['value'];
            }

            return {
                success: true,
                message: 'Cancelled cheque read successfully',
                data: chequeDataResponse,
            };
        } catch (e) {
            return {
                success: false,
                error: e.response?.error || 'An unknown error occured while processing the image',
                data: e.response,
            };
        }
    }

    async selfieVerification(
        akycValidateSelfieDto: AkycValidateSelfieDto,
        selfieFile: Express.Multer.File,
        idCard: Buffer,
    ) {
        // Step 1: liveliness/quality check
        let form = new FormData();
        form.append('image', new Blob([selfieFile.buffer], { type: 'image/png' }));

        try {
            const response = await this.httpService
                .axiosRef({
                    url: 'https://ind.idv.hyperverge.co/v1/checkLiveness',
                    method: 'POST',
                    data: form,
                    headers: {
                        appId: this.hvCreds.appId,
                        appKey: this.hvCreds.appKey,
                        'Content-Type': 'multipart/form-data',
                        transactionId: akycValidateSelfieDto.transaction_id,
                    },
                })
                .then((res) => res.data);
            if (response.result.summary.action !== 'pass') {
                const error = response.result.summary.details[0].message;
                return {
                    success: false,
                    error,
                };
            }
        } catch (e) {
            console.error(e);
            const error = e.response.data.result.summary.details[0].message;
            return {
                success: false,
                error,
            };
        }
        // TODO: Step 2: match against aadhaar
        form = new FormData();

        form.append('selfie', new Blob([selfieFile.buffer], { type: 'image/png' }));
        form.append('id', new Blob([idCard], { type: 'image/png' }));

        try {
            const response = await this.httpService
                .axiosRef({
                    url: 'https://ind-faceid.hyperverge.co/v1/photo/verifyPair',
                    method: 'POST',
                    data: form,
                    headers: {
                        appId: this.hvCreds.appId,
                        appKey: this.hvCreds.appKey,
                        'Content-Type': 'multipart/form-data',
                        transactionId: akycValidateSelfieDto.transaction_id,
                    },
                })
                .then((res) => res.data);
            if (response.result.match !== 'yes') {
                return {
                    success: false,
                    error: 'Selfie does not match with Aadhaar',
                };
            }
        } catch (e) {
            return {
                success: false,
                error: 'Selfie does not match with Aadhaar',
            };
        }

        return {
            success: true,
        };
    }

    async signatureVerification(
        akycValidateSelfieDto: AkycValidateSelfieDto,
        signatureFile: Express.Multer.File,
    ) {
        const form = new FormData();
        console.log('check', signatureFile);
        // add signature to form
        form.append('image', new Blob([signatureFile.buffer], { type: 'image/png' }));

        try {
            const response = await this.httpService
                .axiosRef({
                    url: 'https://ind.thomas.hyperverge.co/v1/signatureDetection',
                    method: 'POST',
                    data: form,
                    headers: {
                        appId: this.hvCreds.appId,
                        appKey: this.hvCreds.appKey,
                        'Content-Type': 'multipart/form-data',
                        transactionId: akycValidateSelfieDto.transaction_id,
                    },
                })
                .then((res) => res.data);
            if (response?.result?.message !== 'One signature detected') {
                const error = response?.error?.message;
                return {
                    success: false,
                    error: error || 'Failed to validate signature',
                };
            }
        } catch (e) {
            console.error(e.response.data);
            const error = e.response?.data?.error?.message;
            return {
                success: false,
                error: error || 'Failed to validate signature',
            };
        }
        return {
            success: true,
        };
    }

    async getGeoLocation(checkLocationDto: CheckLocationDto, transaction_id: string) {
        const response = await this.request(
            {
                url: 'https://ind-thomas.hyperverge.co/v1/reverseGeoCoding',
                data: {
                    latitude: checkLocationDto.latitude.toString(),
                    longitude: checkLocationDto.longitude.toString(),
                },
            },
            transaction_id,
        );
        const results = response.response.result.details.results;
        if (results.length) {
            const result = results[0];

            const adminAreaLevel3 = result.address_components.find((address_component) =>
                address_component.types.includes('administrative_area_level_3'),
            );
            if (adminAreaLevel3) return adminAreaLevel3.long_name;

            const adminAreaLevel2 = result.address_components.find((address_component) =>
                address_component.types.includes('administrative_area_level_2'),
            );
            if (adminAreaLevel2) return adminAreaLevel2.long_name;
        }
        return 'Unknown';
    }

    // Private util function to call HV HTTP APIs
    async request({ ...options }, transactionId: string) {
        try {
            const response = await this.httpService
                .axiosRef({
                    ...options,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        appId: this.hvCreds.appId,
                        appKey: this.hvCreds.appKey,
                        transactionId,
                        ...options.headers,
                    },
                })
                .then((res) => res.data);

            if (parseInt(response.statusCode) !== 200) {
                console.error(`statusCode: ${response.statusCode}`);
                console.error(`response:`, response);
                console.error(
                    `txn: ${options.headers.transactionId}: API ${options.method} ${options.url} failed`,
                );

                return {
                    success: false,
                    statusCode: parseInt(response.statusCode),
                    message: 'Internal server error has occured',
                    error: AkycErrorPanValidation.UNKONWN,
                    response,
                };
            } else {
                return {
                    success: true,
                    statusCode: 200,
                    response,
                };
            }
        } catch (e) {
            return {
                success: false,
                statusCode: e.response.status,
                message: e.message,
                error: AkycErrorPanValidation.UNKONWN,
                response: e.response.data,
            };
        }
    }
}
