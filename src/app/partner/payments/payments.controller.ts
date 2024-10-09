import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { PartnerGuard } from 'src/guards/partner.guard';
import { PaymentsService } from './payments.service';
import { AccountSession } from 'src/decorators/account-session.decorator';
import { GetPamentsReqDto } from './dto/request/get-payments.req.dto';
import { CreatePaymentReqDto } from './dto/request/create-payment.req.dto';
import { Customer } from 'src/decorators/customer.decorator';
import { Product } from 'src/decorators/product.decorator';
import { SessionAccount } from 'src/constants/account.const';
import { CreateIpoPaymentDto } from './dto/request/create-ipo-payment.dto';

@Controller('partner/orders')
@UseGuards(PartnerGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Get()
    getPayments(@AccountSession() session: SessionAccount, @Query() query: GetPamentsReqDto) {
        const queryParams = { page: 1, per_page: 20, ...query };
        return this.paymentsService.getPayments(session.account_id, queryParams);
    }

    @Post()
    createPayment(
        @AccountSession() session: SessionAccount,
        @Customer() customer,
        @Product() product,
        @Body() body: CreatePaymentReqDto,
    ) {
        return this.paymentsService.createPayment(session, customer, product, body);
    }

    @Get(':payment_id')
    getPayment(@Param('payment_id') payment_id: string) {
        return this.paymentsService.getPayment(payment_id);
    }

    @Get('ipo/:group_id')
    getIpoPayment(@Param('group_id') group_id: string) {
        return this.paymentsService.getIpoPayment(group_id);
    }

    @Post('ipo/:payment_id/cancel')
    cancelIpoPayment(@Param('payment_id') payment_id: string) {
        return this.paymentsService.cancelIpoPayment(payment_id);
    }
  
    @Post('ipo')
    createIpoPayment(
        @AccountSession() session: SessionAccount,
        @Body() params: CreateIpoPaymentDto,
    ) {
        return this.paymentsService.createIpoPayment(session, params);
    }
}
