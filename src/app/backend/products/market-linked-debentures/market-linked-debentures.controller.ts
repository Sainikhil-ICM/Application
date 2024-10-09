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
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { UserSession } from 'src/decorators/user-session.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { SessionUser } from 'src/constants/user.const';

import { GetPriceDto } from './dto/get-price.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { GetCustomersDto } from './dto/get-customers.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { MarketLinkedDebenturesService } from './market-linked-debentures.service';

@Controller('market-linked-debentures')
export class MarketLinkedDebenturesController {
    constructor(private readonly marketLinkedDebenturesService: MarketLinkedDebenturesService) {}

    @Get('products')
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        return this.marketLinkedDebenturesService.getProducts(getProductsDto);
    }

    @Get('products/:isin/price')
    @UseGuards(AuthGuard)
    getPrice(@Param('isin') isin: string, @Query() getPriceDto: GetPriceDto) {
        return this.marketLinkedDebenturesService.getPrice(isin, getPriceDto);
    }

    @Get('products/:isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.marketLinkedDebenturesService.getProduct(isin);
    }

    @Get('customers')
    @UseGuards(AuthGuard)
    getCustomers(@UserSession() session: SessionUser, @Query() getCustomersDto: GetCustomersDto) {
        return this.marketLinkedDebenturesService.getCustomers(session, getCustomersDto);
    }

    @Post('payments')
    @UseGuards(AuthGuard)
    createPayment(@UserSession() session: SessionUser, @Body() createPaymentDto: CreatePaymentDto) {
        return this.marketLinkedDebenturesService.createPayment(session, createPaymentDto);
    }

    @Get('payments/:payment_id')
    getPayment(@Param('payment_id', MongoIdPipe) payment_id: ObjectId) {
        return this.marketLinkedDebenturesService.getPayment(payment_id);
    }

    @Get('payments/:payment_id/link')
    getPaymentLink(@Param('payment_id') payment_id: ObjectId) {
        return this.marketLinkedDebenturesService.getPaymentLink(payment_id);
    }
}
