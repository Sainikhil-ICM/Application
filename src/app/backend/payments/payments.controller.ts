import { Controller, Get, Post, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserSession } from 'src/decorators/user-session.decorator';
import { GetPamentsDto } from './dto/get-payments.dto';
import { CreateIpoPaymentDto } from './dto/create-ipo-payment.dto';
import { SendPaymentConsentOtp } from './dto/send-payment-consent-otp.dto';
import { VerifyPaymentConsentOtp } from './dto/verify-payment-consent-otp.dto';
import { SessionUser } from 'src/constants/user.const';

import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { ObjectId } from 'mongoose';

import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.req.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    // @Post()
    // @UseGuards(AuthGuard)
    // createPayment(@UserSession() session: SessionUser, @Body() body: CreatePaymentDto) {
    //     return this.paymentsService.createPayment(session, body);
    // }

    @Get()
    @UseGuards(AuthGuard)
    getPayments(@UserSession() session: SessionUser, @Query() query: GetPamentsDto) {
        return this.paymentsService.getPayments(session, query);
    }

    @Get('/hours')
    @UseGuards(AuthGuard)
    getPaymentsInLastHours(@Query('hours') hours: number) {
        return this.paymentsService.getPaymentsInLastHours(hours);
    }

    @Post('ipo')
    @UseGuards(AuthGuard)
    createIpoPayment(@UserSession() session: SessionUser, @Body() body: CreateIpoPaymentDto) {
        return this.paymentsService.createIpoPayment(session, body);
    }

    @Patch(':payment_id')
    updatePayment(@Param('payment_id', MongoIdPipe) id: ObjectId, @Body() body: UpdatePaymentDto) {
        return this.paymentsService.updatePayment(id, body);
    }

    @Patch(':payment_id/status')
    @UseGuards(AuthGuard)
    updatePaymentStatus(
        @Param('payment_id', MongoIdPipe) id: ObjectId,
        @Body() body: UpdatePaymentStatusDto,
    ) {
        return this.paymentsService.updatePaymentStatus(id, body);
    }

    @Post('send-consent-otp')
    sendPaymentConsentOtp(@Body() body: SendPaymentConsentOtp) {
        return this.paymentsService.sendPaymentConsentOtp(body);
    }

    @Post('verify-consent-otp')
    verifyPaymentConsentOtp(@Body() body: VerifyPaymentConsentOtp) {
        return this.paymentsService.verifyPaymentConsentOtp(body);
    }

    @Get('ipo/:payment_id/sync')
    syncIpoPayment(@Param('payment_id') payment_id: string) {
        return this.paymentsService.syncIpoPayment(payment_id);
    }

    @Post('ipo/:payment_id/cancel')
    cancelIpoPayment(@Param('payment_id') payment_id: string) {
        return this.paymentsService.cancelIpoPayment(payment_id);
    }

    @Get('ipo/:group_id')
    getIpoPayment(@Param('group_id') group_id: string) {
        return this.paymentsService.getIpoPayment(group_id);
    }

    // @Get(':payment_id/link')
    // getPaymentLink(@Param('payment_id') payment_id: ObjectId) {
    //     return this.paymentsService.getPaymentLink(payment_id);
    // }

    // @Get(':payment_id/sync')
    // syncPayment(@Param('payment_id') payment_id: string) {
    //     return this.paymentsService.syncPayment(payment_id);
    // }

    // @Get(':payment_id')
    // getPayment(@Param('payment_id', MongoIdPipe) payment_id: string) {
    //     return this.paymentsService.getPaymentDetails(payment_id);
    // }

    @Post(':payment_id/resend-phone-otp')
    resendPhoneOtp(@Param('payment_id', MongoIdPipe) payment_id: string) {
        return this.paymentsService.resendPhoneOtp(payment_id);
    }

    @Post(':payment_id/resend-email-otp')
    resendEmailOtp(@Param('payment_id', MongoIdPipe) payment_id: string) {
        return this.paymentsService.resendEmailOtp(payment_id);
    }
}
