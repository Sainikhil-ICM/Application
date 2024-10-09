import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AuthGuard } from 'src/guards/auth.guard';
import { GetPriceDto } from './dto/get-price.dto';
import GetProductsDto from './dto/get-products.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { SessionUser } from 'src/constants/user.const';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UserSession } from 'src/decorators/user-session.decorator';
import { UnlistedEquitiesService } from './unlisted-equities.service';

@Controller('unlisted-equities')
export class UnlistedEquitiesController {
    constructor(private readonly unlistedEquitiesService: UnlistedEquitiesService) {}

    @Get('products')
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        const queryParams = { page: 1, per_page: 99, ...getProductsDto };
        return this.unlistedEquitiesService.getProducts(queryParams);
    }

    @Get('products/:isin/price')
    @UseGuards(AuthGuard)
    getPrice(@Param('isin') isin: string, @Query() getPriceDto: GetPriceDto) {
        return this.unlistedEquitiesService.getPrice(isin, getPriceDto);
    }

    @Get('products/:isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.unlistedEquitiesService.getProduct(isin);
    }

    @Get('customers')
    @UseGuards(AuthGuard)
    getCustomers(@UserSession() session: SessionUser, @Query() getCustomersDto: GetCustomersDto) {
        return this.unlistedEquitiesService.getCustomers(session, getCustomersDto);
    }

    @Post('payments')
    @UseGuards(AuthGuard)
    createPayment(@UserSession() session: SessionUser, @Body() createPaymentDto: CreatePaymentDto) {
        return this.unlistedEquitiesService.createPayment(session, createPaymentDto);
    }

    @Get('payments/:payment_id/link')
    getPaymentLink(@Param('payment_id') paymentId: ObjectId) {
        return this.unlistedEquitiesService.getPaymentLink(paymentId);
    }

    @Get('payments/:payment_id/sync')
    syncPayment(@Param('payment_id') paymentId: ObjectId) {
        return this.unlistedEquitiesService.syncPayment(paymentId);
    }

    @Get('payments/:payment_id')
    getPayment(@Param('payment_id', MongoIdPipe) paymentId: ObjectId) {
        return this.unlistedEquitiesService.getPayment(paymentId);
    }

    @Get('user-products/sync')
    @UseGuards(AuthGuard)
    syncUserProducts() {
        return this.unlistedEquitiesService.syncUserProducts();
    }

    @Get('user-products/:isin')
    @UseGuards(AuthGuard)
    getUserProduct(@UserSession() session: SessionUser, @Param('isin') isin: string) {
        return this.unlistedEquitiesService.getUserProduct(session, isin);
    }
}
