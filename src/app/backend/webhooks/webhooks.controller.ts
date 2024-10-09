import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookEventDto } from './dto/webhook-event.dto';
import { OrderStatus } from 'src/constants/payment.const';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserSession } from 'src/decorators/user-session.decorator';
import { SessionUser } from 'src/constants/user.const';
import { ConnectionType } from 'src/models';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) {}

    @Post()
    @UseGuards(AuthGuard)
    async createWebhook(@UserSession() session: SessionUser, @Body() body: CreateWebhookDto) {
        return this.webhooksService.createWebhook(session, body);
    }

    @Get()
    @UseGuards(AuthGuard)
    async getWebhooks(@UserSession() session: SessionUser) {
        return this.webhooksService.getWebhooks(session);
    }

    @Post('events/:source')
    async icmEvents(@Body() params: WebhookEventDto, @Param('source') source: ConnectionType) {
        console.log(
            '🚀 ~ file: webhooks.controller.ts:11 ~ WebhooksController ~ index ~ params:',
            JSON.stringify(params, null, 2),
        );

        // TODO - Maintain a log of all the events on webhook collection.

        // TODO separation needed here between icm webhook and bidd webhook for KYC events

        if (params.event === 'kycRejected') {
            this.webhooksService.updateCustomerStatus({
                ...params.data,
                status: CustomerKycStatus.KYC_REJECTED,
                source,
            });
        } else if (params.event === 'kycAccepted') {
            this.webhooksService.updateCustomerStatus({
                ...params.data,
                status: CustomerKycStatus.KYC_VERIFIED,
                source,
            });
        } else if (params.event === 'digioSignInitiated') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.DIGIO_SIGN_INITIATED,
            });
        } else if (params.event === 'digioSignSuccess') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.DIGIO_SIGN_SUCCESS,
            });
        } else if (params.event === 'digioSignFailed') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.DIGIO_SIGN_FAILED,
            });
        } else if (params.event === 'orderCreated') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.ORDER_CREATED,
            });
            // } else if (params.event === 'orderFailed') {
            //     this.webhooksService.updateOrderStatus({
            //         ...params.data,
            //         status: OrderStatus.ORDER_FAILED,
            //     });
        } else if (params.event === 'orderProcessed') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.ORDER_PROCESSED,
            });
        } else if (params.event === 'orderRejected') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.ORDER_REJECTED,
            });
        } else if (params.event === 'paymentSuccess') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.PAYMENT_SUCCESS,
            });
        } else if (params.event === 'paymentFailed') {
            this.webhooksService.updateOrderStatus({
                ...params.data,
                status: OrderStatus.PAYMENT_FAILED,
            });
        }

        return;
    }
}

const payload = {
    version: 'v1',
    timestamp: '2021-08-31T10:00:00.000Z',
    event: 'CUSTOMER_CREATED',
    data: {
        id: '$CUSTOMER_ID',
        metadata: {},
    },
};
