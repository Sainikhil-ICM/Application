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
import { ListedBondsService } from './listed-bonds.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { SessionUser } from 'src/constants/user.const';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPriceDto } from './dto/get-price.dto';
import GetProductsDto from './dto/get-products.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { ObjectId } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { GetCustomersDto } from './dto/get-customers.dto';

@Controller('listed-bonds')
export class ListedBondsController {
    constructor(private readonly listedBondsService: ListedBondsService) {}

    @Post('products')
    @UseGuards(AuthGuard)
    createProduct(@Body() createProductDto: CreateProductDto) {
        return this.listedBondsService.createProduct(createProductDto);
    }

    @Get('products')
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        return this.listedBondsService.getProducts(getProductsDto);
    }

    // @Get('products')
    // // @UseInterceptors(ClassSerializerInterceptor)
    // getProducts(@Query() getProductsDto: GetProductsDto) {
    //     const queryParams = { page: 1, per_page: 99, ...getProductsDto };
    //     return this.listedBondsService.getProducts(queryParams);
    // }

    @Get('products/:isin/price')
    @UseGuards(AuthGuard)
    getPrice(@Param('isin') isin: string, @Query() getPriceDto: GetPriceDto) {
        return this.listedBondsService.getPrice(isin, getPriceDto);
    }

    @Get('products/:isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.listedBondsService.getProduct(isin);
    }

    // @Get('products/:isin')
    // // @UseInterceptors(ClassSerializerInterceptor)
    // getProduct(@Param('isin') isin: string) {
    //     return this.listedBondsService.getProduct(isin);
    // }

    @Get('customers')
    @UseGuards(AuthGuard)
    getCustomers(@UserSession() session: SessionUser, @Query() getCustomersDto: GetCustomersDto) {
        return this.listedBondsService.getCustomers(session, getCustomersDto);
    }

    @UseGuards(AuthGuard)
    @Get('customers/:customer_id/portfolio')
    getCustomerPortfolio(@Param('customer_id', MongoIdPipe) customer_id: ObjectId) {
        return this.listedBondsService.getCustomerPortfolio(customer_id);
    }

    @Post('payments')
    @UseGuards(AuthGuard)
    createPayment(@UserSession() session: SessionUser, @Body() createPaymentDto: CreatePaymentDto) {
        return this.listedBondsService.createPayment(session, createPaymentDto);
    }

    @Get('payments/:payment_id')
    getPayment(@Param('payment_id', MongoIdPipe) paymentId: ObjectId) {
        return this.listedBondsService.getPayment(paymentId);
    }

    @Get('payments/:payment_id/link')
    getPaymentLink(@Param('payment_id') paymentId: ObjectId) {
        return this.listedBondsService.getPaymentLink(paymentId);
    }

    @Get('payments/:payment_id/sync')
    syncPayment(@Param('payment_id') paymentId: ObjectId) {
        return this.listedBondsService.syncPayment(paymentId);
    }

    @Get('user-products/sync')
    @UseGuards(AuthGuard)
    syncUserProducts() {
        return this.listedBondsService.syncUserProducts();
    }

    @Get('user-products/:isin')
    @UseGuards(AuthGuard)
    getUserProduct(@UserSession() session: SessionUser, @Param('isin') isin: string) {
        return this.listedBondsService.getUserProduct(session, isin);
    }
}
