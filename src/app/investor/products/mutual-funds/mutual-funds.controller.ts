import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { MutualFundsService } from './mutual-funds.service';
import GetProductsDto from './dto/get-products.dto';

@Controller('investor/mutual-funds')
export class MutualFundsController {
    constructor(private readonly mutualFundsService: MutualFundsService) {}

    @Get('products')
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        const queryParams = { page: 1, per_page: 99, ...getProductsDto };
        return this.mutualFundsService.getProducts(queryParams);
    }

    @Get('products/:isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.mutualFundsService.getProduct(isin);
    }

    @Get('products/:amfi_code/nav')
    getMutualFundNav(@Param('amfi_code') amfi_code: string, @Query('previous') previous: number) {
        return this.mutualFundsService.getNavData(amfi_code, previous);
    }

    @Get('products/:isin/sip-dates')
    getMutualFundSipDates(@Param('isin') isin: string) {
        return this.mutualFundsService.getSipDates(isin);
    }
}
