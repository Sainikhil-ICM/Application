import {
    Controller,
    Post,
    Body,
    Patch,
    Param,
    Get,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    ParseFilePipeBuilder,
    HttpStatus,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { CustomersService } from './customers.service';

import { CreateCustomerDto } from './dto/create-customer.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UploadChequeDto, ValidatePanDto, VerifyBankDto } from './dto/kyc.dto';

import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { CustomerGuard } from 'src/guards/customer.guard';
import { SessionCustomer } from 'src/constants/customer.const';
import { CustomerSession } from 'src/decorators/customer-session.decorator';

@Controller('investor/customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post()
    createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.createCustomer(createCustomerDto);
    }

    @Post('login')
    loginCustomer(@Body() loginCustomerDto: LoginCustomerDto) {
        return this.customersService.loginCustomer(loginCustomerDto);
    }

    @Post('verify-otp')
    verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.customersService.verifyOtp(verifyOtpDto);
    }

    @Post('resend-otp')
    resendOTP(@Body() loginCustomerDto: LoginCustomerDto) {
        return this.customersService.resendOTP(loginCustomerDto);
    }

    @Patch(':customer_id')
    updateCustomer(
        @Param('customer_id', MongoIdPipe) customerId: ObjectId,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ) {
        return this.customersService.updateCustomer(customerId, updateCustomerDto);
    }

    @Get(':customer_id/users')
    getAdvisors(@Param('customer_id', MongoIdPipe) customerId: ObjectId) {
        return this.customersService.getAdvisors(customerId);
    }

    @UseGuards(CustomerGuard)
    @Post(':customer_id/validate-pan')
    validatePan(
        @CustomerSession() session: SessionCustomer,
        @Body() validatePanDto: ValidatePanDto,
    ) {
        return this.customersService.validatePan(session, validatePanDto);
    }

    @UseGuards(CustomerGuard)
    @Post(':customer_id/verify-bank')
    verifyBankAccount(@Body() verifyBankDto: VerifyBankDto) {
        return this.customersService.verifyBankAccount(verifyBankDto);
    }

    @Post(':customer_id/upload')
    @UseGuards(CustomerGuard)
    @UseInterceptors(AnyFilesInterceptor())
    uploadFile(
        @CustomerSession() session: SessionCustomer,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|pdf)$/,
                })
                .addMaxSizeValidator({ maxSize: 12000000 })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        files: Express.Multer.File[],
    ) {
        return this.customersService.uploadFile(session, files[0]);
    }

    @UseGuards(CustomerGuard)
    @Post(':customer_id/upload-cheque')
    uploadCancelledCheque(@Body() uploadChequeDto: UploadChequeDto) {
        return this.customersService.uploadCancelledCheque(uploadChequeDto);
    }

    @UseGuards(CustomerGuard)
    @Post(':customer_id/add-nominees')
    addNominees(@CustomerSession() session: SessionCustomer, @Body() addNomineesDto: any) {
        return this.customersService.addNominees(session, addNomineesDto);
    }

    @UseGuards(CustomerGuard)
    @Post(':customer_id/digilocker-request')
    processDigilockerRequest(
        @CustomerSession() session: SessionCustomer,
        @Body('reset') reset?: boolean,
    ) {
        return this.customersService.processDigilockerRequest(session, reset);
    }

    @UseGuards(CustomerGuard)
    @Get(':customer_id/digilocker')
    getDigilockerData(@CustomerSession() session: SessionCustomer) {
        return this.customersService.getDigilockerData(session);
    }

    @UseGuards(CustomerGuard)
    @Post(':customer_id/validate-selfie')
    @UseInterceptors(AnyFilesInterceptor())
    validateSelfie(
        @CustomerSession() session: SessionCustomer,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|pdf)$/,
                })
                .addMaxSizeValidator({ maxSize: 12000000 })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        files: Express.Multer.File[],
        @Body('transaction_id')
        transaction_id: string,
    ) {
        return this.customersService.validateSelfie(session, transaction_id, files);
    }

    @UseGuards(CustomerGuard)
    @Post(':customer_id/validate-signature')
    @UseInterceptors(AnyFilesInterceptor())
    validateSignature(
        @CustomerSession() session: SessionCustomer,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|pdf)$/,
                })
                .addMaxSizeValidator({ maxSize: 12000000 })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        files: Express.Multer.File[],
        @Body('transaction_id')
        transaction_id: string,
    ) {
        return this.customersService.validateSignature(session, transaction_id, files);
    }

    @UseGuards(CustomerGuard)
    @Get(':customer_id/esign-request')
    getEsignDocumentId(@CustomerSession() session: SessionCustomer) {
        return this.customersService.getEsignDocumentId(session);
    }

    @UseGuards(CustomerGuard)
    @Get(':customer_id/submit-form')
    submitFinalForm(@CustomerSession() session: SessionCustomer) {
        return this.customersService.submitFinalForm(session);
    }
}
