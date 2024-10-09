import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
    ParseBoolPipe,
} from '@nestjs/common';

import { ObjectId } from 'mongoose';
import { AuthGuard } from 'src/guards/auth.guard';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { SessionUser } from 'src/constants/user.const';
import { MutualFundsService } from './mutual-funds.service';
import { UserSession } from 'src/decorators/user-session.decorator';

import GetProductsDto from './dto/get-products.dto';
import GetTaxFillingDto from './dto/get-tax-filling.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { GetCustomerTxnsDto } from './dto/get-customer-txns.dto';
import { CreateSwpPaymentDto } from './dto/create-swp-payment.dto';
import { CreateStpPaymentDto } from './dto/create-stp-payment.dto';
import { GetFolioWiseUnitsDto } from './dto/get-folio-wise-units.dto';
import { CreateSwitchPaymentDto } from './dto/create-switch-payment.dto';
import { VerifyPaymentOtpDto } from '../../payments/dto/verify-payment-otp.dto';
import { CreateRedemptionPaymentDto } from './dto/create-redemption-payment.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import GetSwitchInOutTransactionsDto from './dto/get-switch-in-out-transactions.dto';

@Controller('mutual-funds')
export class MutualFundsController {
    constructor(private readonly mutualFundsService: MutualFundsService) {}

    // Product Routes
    @Get('products')
    @UseGuards(AuthGuard)
    // @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        const queryParams = { page: 1, per_page: 99, ...getProductsDto };
        return this.mutualFundsService.getProducts(queryParams);
    }

    @Get('products/:isin/switch-to-funds')
    getSwitchToFunds(@Param('isin') isin: string, @Query('is_stp', ParseBoolPipe) is_stp: boolean) {
        return this.mutualFundsService.getSwitchToFunds(isin, is_stp);
    }

    @Get('products/:isin/sip-dates')
    getMutualFundSipDates(@Param('isin') isin: string) {
        return this.mutualFundsService.getSipDates(isin);
    }

    @Get('products/:isin/stp')
    getMutualFundStpDates(@Param('isin') isin: string) {
        return this.mutualFundsService.getMutualFundStpDates(isin);
    }

    @Get('products/:isin/swp')
    getMutualFundSwpInfo(@Param('isin') isin: string) {
        return this.mutualFundsService.getMutualFundSwpInfo(isin);
    }

    @Get('products/:amfi_code/nav')
    getMutualFundNav(@Param('amfi_code') amfi_code: string, @Query('previous') previous: number) {
        return this.mutualFundsService.getNavData(amfi_code, previous);
    }

    @Get('products/:isin')
    // @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.mutualFundsService.getProduct(isin);
    }

    // Customer Routes
    @Post('customers/:customer_id/transaction-timeline')
    @UseGuards(AuthGuard)
    getTransactionTimelineData(@Param('customer_id') customer_id: string) {
        return this.mutualFundsService.getTransactionTimelineData(customer_id);
    }

    @Get('customers')
    @UseGuards(AuthGuard)
    getCustomers(@UserSession() session: SessionUser, @Query() getCustomersDto: GetCustomersDto) {
        return this.mutualFundsService.getCustomers(session, getCustomersDto);
    }

    @Get('customers/:customer_id/portfolio')
    @UseGuards(AuthGuard)
    getMfPortfolio(@Param('customer_id', MongoIdPipe) customer_id: string) {
        return this.mutualFundsService.getCustomerMfPortfolio(customer_id);
    }

    @Get('customers/:customer_id/transactions')
    @UseGuards(AuthGuard)
    getCustomerTxns(
        @Param('customer_id', MongoIdPipe) customer_id: ObjectId,
        @Query() getCustomerTxnsDto: GetCustomerTxnsDto,
    ) {
        return this.mutualFundsService.getCustomerTxns(customer_id, getCustomerTxnsDto);
    }

    @Get('customers/:customer_id/folio-wise-units')
    @UseGuards(AuthGuard)
    getCustomerFolioWiseUnits(
        @Param('customer_id', MongoIdPipe) customer_id: string,
        @Query() query: GetFolioWiseUnitsDto,
    ) {
        return this.mutualFundsService.getCustomerFolioWiseUnits(customer_id, query);
    }

    @Get('customers/:customer_id/tax-report')
    @UseGuards(AuthGuard)
    getMFTaxReportData(
        @Param('customer_id') customer_id: string,
        @Query() getTaxFillingDto: GetTaxFillingDto,
    ) {
        return this.mutualFundsService.getMfTaxReportData(customer_id, getTaxFillingDto);
    }

    @Get('customers/:customer_id/tax-chart')
    @UseGuards(AuthGuard)
    getMfTaxChartData(@Param('customer_id') customer_id: string) {
        return this.mutualFundsService.getMfTaxChartData(customer_id);
    }

    @Get('customers/:customer_id/transactions-in-flow')
    @UseGuards(AuthGuard)
    getTransactionInFlowData(
        @Param('customer_id') customer_id: string,
        @Query() getSwitchInTransactionsDto: GetSwitchInOutTransactionsDto,
    ) {
        const queryParams = { ...getSwitchInTransactionsDto };
        return this.mutualFundsService.getTransactionInFlowData(customer_id, queryParams);
    }

    @Get('customers/:customer_id/transactions-out-flow')
    @UseGuards(AuthGuard)
    getTransactionOutFlowData(
        @Param('customer_id') customer_id: string,
        @Query() getSwitchOutTransactionsDto: GetSwitchInOutTransactionsDto,
    ) {
        const queryParams = { ...getSwitchOutTransactionsDto };
        return this.mutualFundsService.getTransactionOutFlowData(customer_id, queryParams);
    }

    // Payment Routes
    @Post('payments')
    @UseGuards(AuthGuard)
    createMutualFundsPayment(
        @UserSession() session: SessionUser,
        @Body() createPaymentDto: CreatePaymentDto,
    ) {
        return this.mutualFundsService.createPayment(session, createPaymentDto);
    }

    @Post('payments/stp')
    @UseGuards(AuthGuard)
    createStpPayment(@UserSession() session: SessionUser, @Body() body: CreateStpPaymentDto) {
        return this.mutualFundsService.createStpPayment(session, body);
    }

    @Post('payments/swp')
    @UseGuards(AuthGuard)
    createSwpPayment(@UserSession() session: SessionUser, @Body() body: CreateSwpPaymentDto) {
        return this.mutualFundsService.createSwpPayment(session, body);
    }

    @Post('payments/redemption')
    @UseGuards(AuthGuard)
    createRedemptionPayment(
        @UserSession() session: SessionUser,
        @Body() createRedemptionPaymentDto: CreateRedemptionPaymentDto,
    ) {
        return this.mutualFundsService.createRedemptionPayment(session, createRedemptionPaymentDto);
    }

    @Post('payments/switch')
    @UseGuards(AuthGuard)
    createSwitchPayment(@UserSession() session: SessionUser, @Body() body: CreateSwitchPaymentDto) {
        return this.mutualFundsService.createSwitchPayment(session, body);
    }

    @Post('payments/:payment_id/verify-customer-otp')
    async verifyConsentOtp(
        @Body() body: VerifyPaymentOtpDto,
        @Param('payment_id', MongoIdPipe) payment_id: string,
    ) {
        return await this.mutualFundsService.verifyCustomerConsentOtp(body, payment_id);
    }

    @Get('payments/:payment_id/fetch-banks')
    fetchBanks(@Param('payment_id') payment_id: ObjectId) {
        return this.mutualFundsService.fetchBanks(payment_id);
    }

    @Get('payments/:payment_id/payment-url')
    getMutualFundsPaymentUrl(@Param('payment_id') payment_id: ObjectId) {
        return this.mutualFundsService.getMutualFundsPaymentUrl(payment_id);
    }

    @Get('payments/:payment_id/fetch-payment-status')
    fetchMutualFundsPaymentStatus(@Param('payment_id') payment_id: ObjectId) {
        return this.mutualFundsService.fetchMutualFundsPaymentStatus(payment_id);
    }

    @Get('payments/:payment_id')
    getMutualFundsPayment(@Param('payment_id', MongoIdPipe) payment_id: string) {
        return this.mutualFundsService.getMutualFundsPayment(payment_id);
    }
}
