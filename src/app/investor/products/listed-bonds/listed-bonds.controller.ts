import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';

import { ListedBondsService } from './listed-bonds.service';

import GetProductsDto from './dto/get-products.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

import { CustomerGuard } from 'src/guards/customer.guard';
import { CustomerSession } from 'src/decorators/customer-session.decorator';
import { SessionCustomer } from 'src/constants/customer.const';

@Controller('investor/listed-bonds')
export class ListedBondsController {
    constructor(private readonly listedBondsService: ListedBondsService) {}

    @Get('products')
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        const queryParams = { page: 1, per_page: 99, ...getProductsDto };
        return this.listedBondsService.getProducts(queryParams);
    }

    @Get('products/:isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.listedBondsService.getProduct(isin);
    }

    @Get('products/:isin/price')
    @UseInterceptors(ClassSerializerInterceptor)
    getPrice(@Param('isin') isin: string, @Query('units') units: number) {
        return this.listedBondsService.getPrice(isin, units);
    }

    @UseGuards(CustomerGuard)
    @Post('payments')
    getPaymentLink(
        @CustomerSession() session: SessionCustomer,
        @Body() createPaymentDto: CreatePaymentDto,
    ) {
        return this.listedBondsService.getPaymentLink(session, createPaymentDto);
    }
}
