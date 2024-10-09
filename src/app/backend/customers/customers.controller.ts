import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { InviteCustomerDto } from './dto/invite-customer.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserSession } from 'src/decorators/user-session.decorator';
import { ValidatePanDto } from './dto/validate-pan.dto';
import { VerificationTokenDto } from './dto/get-verification-token.dto';
import { SendConsentDto } from './dto/send-consent.dto';
import { UpdateCustomerDto } from './dto/upadte-customer.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { GetPennyDropStatusDto } from './dto/get-penny-drop-status.dto';
import { VerifyCustomerConsentDto } from './dto/verify-customer-consent.dto';
import { WhatsappConsentDto } from './dto/whatsapp-consent.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { SessionUser } from 'src/constants/user.const';
import { AcceptRejectKYCDto } from './dto/accept-reject-kyc.req.dto';
import { SubmitOnboardingKycDto } from './dto/submit-onboarding-kyc.dto';
import {
    AkycCustomerRejectKycDto,
    AkycDigilockerRequestDto,
    AkycGetCustomerProfileQueryDto,
    AkycSubmitCustomerProfileDto,
    AkycValidateSelfieDto,
    AkycVerifyPanDto,
} from './dto/akyc.dto';
import { CheckLocationDto } from './dto/check-location.dto';
import { SubmitSignedFormDto } from './dto/submit-signed-form.dto';
import { GetDematDetailsDto } from './dto/get-demat-details.dto';
import { ObjectId } from 'mongoose';

@Controller('customers')
export class CustomersController {
    constructor(private customersService: CustomersService) {}

    @Post()
    @UseGuards(AuthGuard)
    creatCustomer(
        @UserSession() session: SessionUser,
        @Body() createCustomerDto: CreateCustomerDto,
    ) {
        return this.customersService.createCustomer(session, createCustomerDto);
    }

    @Get()
    @UseGuards(AuthGuard)
    getCustomers(@UserSession() session: SessionUser, @Query() getCustomersDto: GetCustomersDto) {
        return this.customersService.getCustomers(session, getCustomersDto);
    }

    @Get('hours')
    @UseGuards(AuthGuard)
    getCustomersinLastHours(@UserSession() session: SessionUser, @Query('hours') hours: number) {
        return this.customersService.getCustomersInLastHours(session.user_id, hours);
    }

    @Post('invite')
    @UseGuards(AuthGuard)
    inviteCustomer(
        @UserSession() session: SessionUser,
        @Body() inviteCustomerDto: InviteCustomerDto,
    ) {
        return this.customersService.inviteCustomer(session, inviteCustomerDto);
    }

    @Post(':customer_id/resend-phone-otp')
    resendPhoneOtp(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.customersService.resendPhoneOtp(customer_id);
    }

    @Post(':customer_id/resend-email-otp')
    resendEmailOtp(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.customersService.resendEmailOtp(customer_id);
    }

    @Post(':customer_id/verify-customer-otp')
    async verifyConsentOtp(
        @Body() body: VerifyCustomerConsentDto,
        @Param('customer_id', MongoIdPipe) customer_id: string,
    ) {
        return await this.customersService.verifyCustomerConsentOtp(body, customer_id);
    }

    @Post('whatsapp-consent')
    async updateWhatsappConsent(@Body() body: WhatsappConsentDto) {
        return await this.customersService.updateWhatsappConsent(body);
    }

    @Post('send-consent')
    @UseGuards(AuthGuard)
    sendCustomerConsent(@Body() body: SendConsentDto) {
        return this.customersService.sendCustomerConsent(body);
    }

    @Post('validate-pan')
    @UseGuards(AuthGuard)
    validatePan(@UserSession() session: SessionUser, @Body() validatePanDto: ValidatePanDto) {
        return this.customersService.validatePan(session, validatePanDto);
    }

    @Post('get-verification-token')
    getBankToken(@Body() body: VerificationTokenDto) {
        return this.customersService.getVerificationToken(body);
    }

    @Post('penny-drop-status')
    @UseGuards(AuthGuard)
    getPennyDropStatus(@Body() params: GetPennyDropStatusDto) {
        return this.customersService.getPennyDropStatus(params);
    }

    @Get('sync')
    @UseGuards(AuthGuard)
    syncCustomers(@UserSession() session: SessionUser) {
        return this.customersService.syncCustomers(session);
    }

    @Post(':customer_id/accept-reject-kyc')
    acceptRejectKyc(
        @Param('customer_id', MongoIdPipe) customer_id: string,
        @Body() body: AcceptRejectKYCDto,
    ) {
        return this.customersService.acceptRejectKyc(body, customer_id);
    }

    @Get(':customer_id/portfolio')
    getCustomerPortfolio(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.customersService.getCustomerPortfolio(customer_id);
    }

    @Get(':customer_id/init-hyper-verge')
    getCustomerHypervergeData(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.customersService.getCustomerHyperVergeData(customer_id);
    }

    @Get(':customer_id/polling-hyper-verge')
    getCustomerHyperVergePolingData(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.customersService.getCustomerHyperVergePollingData(customer_id);
    }

    @UseGuards(AuthGuard)
    @Get(':customer_id/unlisted-equities/portfolio-b2c')
    getCustomerUnlistedPortfolio(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.customersService.getCustomerUnlistedPortfolio(customer_id);
    }

    @Post(':id/confirm-consent')
    sendCustomerDocstoAdmin(@Param('id') customer_id: string) {
        return this.customersService.sendCustomerDocstoAdmin(customer_id);
    }

    @Post(':id/create-ucc')
    createCustomerUcc(@Param('id') customer_id: string) {
        return this.customersService.createCustomerUCC(customer_id);
    }

    @Post(':id/update-ucc')
    updateCustomerUcc(@Param('id') customer_id: string) {
        return this.customersService.updateCustomerUCC(customer_id);
    }

    @Post(':id/create-mandate')
    createCusomerMandate(@Param('id') customer_id: string) {
        return this.customersService.createCustomerMandate(customer_id);
    }

    @Post(':customer_id/upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(AnyFilesInterceptor())
    uploadFile(
        @Param('customer_id', MongoIdPipe) customer_id: string,
        @UserSession() session: SessionUser,
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
        return this.customersService.uploadFile(customer_id, files[0], session);
    }

    @Get(':customer_id/sync')
    @UseGuards(AuthGuard)
    syncCustomer(
        @UserSession() session: SessionUser,
        @Param('customer_id', MongoIdPipe) customerId: ObjectId,
    ) {
        return this.customersService.syncCustomer(customerId, session);
    }

    @Get(':customer_id')
    getCustomer(@Param('customer_id') customer_id: string, @Query('full') fullProfile?: string) {
        if (fullProfile === 'true') {
            return this.customersService.getCustomerProfile(customer_id);
        }
        return this.customersService.getCustomer(customer_id);
    }

    @Get(':customer_id/mandate-status')
    getCustomerMandateStatus(@Param('customer_id') customer_id: string) {
        return this.customersService.getCustomerMandateStatus(customer_id);
    }

    @Get(':customer_id/validate-kyc')
    validateCustomerKyc(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.customersService.validateCustomerKyc();
    }

    @Patch(':customer_id')
    updateCustomer(
        @Param('customer_id', MongoIdPipe) customer_id: string,
        @Body() body: UpdateCustomerDto,
    ) {
        return this.customersService.updateCustomer(customer_id, body);
    }

    @Post('submit-onboarding-kyc')
    @UseGuards(AuthGuard)
    submitOnboardingKyc(
        @UserSession() session: SessionUser,
        @Body() submitOnboardingKycDto: SubmitOnboardingKycDto,
    ) {
        return this.customersService.okycSubmitProfile(session, submitOnboardingKycDto);
    }

    @Get(':customer_id/send-kyc-form')
    @UseGuards(AuthGuard)
    sendPrefilledKycForm(
        @Param('customer_id', MongoIdPipe) customer_id: string,
        @UserSession() session: SessionUser,
    ) {
        return this.customersService.okycSendPrefilledForm(session, customer_id);
    }
    @Post('assisted-kyc/verify-pan')
    @UseGuards(AuthGuard)
    akycVerifyPan(@UserSession() session: SessionUser, @Body() body: AkycVerifyPanDto) {
        return this.customersService.akycVerifyPan(session, body);
    }

    @Post('assisted-kyc/verify-bank-account')
    @UseGuards(AuthGuard)
    akycVerifyAccount(
        @UserSession() session: SessionUser,
        @Body() body: AkycSubmitCustomerProfileDto,
    ) {
        return this.customersService.akycVerifyBankAccount(session, body);
    }

    @Post('assisted-kyc/verify-cancelled-cheque')
    @UseGuards(AuthGuard)
    akycVerifyCancelledCheque(
        @UserSession() session: SessionUser,
        @Body() body: AkycSubmitCustomerProfileDto,
    ) {
        return this.customersService.akycVerifyCancelledCheque(session, body);
    }

    @Post('assisted-kyc/submit')
    @UseGuards(AuthGuard)
    akycSubmit(@UserSession() session: SessionUser, @Body() body: AkycSubmitCustomerProfileDto) {
        return this.customersService.akycSubmitCustomerProfile(session, body);
    }

    @Post('assisted-kyc/send-customer-otp')
    akycSendCustomerOtp(@Body() akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto) {
        return this.customersService.akycSendCustomerOtp(akycGetCustomerProfileQueryDto);
    }

    @Post('assisted-kyc/validate-selfie')
    @UseInterceptors(AnyFilesInterceptor())
    akycValidateSelfie(
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
        @Body()
        akycValidateSelfieDto: AkycValidateSelfieDto,
    ) {
        return this.customersService.akycValidateSelfie(akycValidateSelfieDto, files);
    }

    @Post('assisted-kyc/validate-signature')
    @UseInterceptors(AnyFilesInterceptor())
    akycValidateSignature(
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
        @Body()
        akycValidateSelfieDto: AkycValidateSelfieDto,
    ) {
        return this.customersService.akycValidateSignature(akycValidateSelfieDto, files);
    }

    @Post('check-location')
    checkLocation(@Body() checkLocationDto: CheckLocationDto) {
        return this.customersService.checkLocation(checkLocationDto);
    }

    @Post('assisted-kyc/esign-request')
    akycEsignRequest(@Body() akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto) {
        return this.customersService.akycGetEsignDocumentId(akycGetCustomerProfileQueryDto);
    }

    @Post('assisted-kyc/digilocker-request')
    akycDigilockerRequest(@Body() akycDigilockerRequestDto: AkycDigilockerRequestDto) {
        return this.customersService.akycDigilockerCreateRequest(akycDigilockerRequestDto);
    }

    @Post('assisted-kyc/digilocker-verify')
    akycDigilockerVerify(@Body() akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto) {
        return this.customersService.akycDigilockerCheckData(akycGetCustomerProfileQueryDto);
    }

    @Post('assisted-kyc/customer-reject-kyc')
    akycCustomerRejectKyc(@Body() akycCustomerRejectKycDto: AkycCustomerRejectKycDto) {
        return this.customersService.akycCustomerRejectKyc(akycCustomerRejectKycDto);
    }

    @Post('submit-kyc-signed-form')
    submitSignedKycForm(@Body() submitSignedFormDto: SubmitSignedFormDto) {
        return this.customersService.submitSignedForm(submitSignedFormDto);
    }

    @Post('convert-pdf-to-image')
    @UseInterceptors(AnyFilesInterceptor())
    async convertPdfToImage(
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|pdf)$/,
                })
                .addMaxSizeValidator({ maxSize: 50000000 })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        files: Express.Multer.File[],
    ): Promise<string> {
        return await this.customersService.convertPdfToImage(files);
    }

    @Post('assisted-kyc/fetch-signed-form')
    async akycFetchSignedForm(
        @Body() akycGetCustomerProfileQueryDto: AkycGetCustomerProfileQueryDto,
    ) {
        return this.customersService.akycFetchSignedForm(akycGetCustomerProfileQueryDto);
    }

    @Post(':customer_id/demat-broker')
    @UseGuards(AuthGuard)
    getDematDetails(
        @Param('customer_id', MongoIdPipe) customer_id: string,
        @Body() body: GetDematDetailsDto,
    ) {
        return this.customersService.getDematDetails(customer_id, body);
    }
}
