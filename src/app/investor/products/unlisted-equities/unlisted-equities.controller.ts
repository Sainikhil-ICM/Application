import {
    Controller,
    Get,
    Param,
    UseGuards,
    Query,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';

import GetPriceDto from './dto/get-price.dto';
import GetProductsDto from './dto/get-products.dto';

// import { AuthGuard } from 'src/guards/auth.guard';
import { UnlistedEquitiesService } from './unlisted-equities.service';

@Controller('investor/unlisted-equities')
export class UnlistedEquitiesController {
    constructor(private readonly unlistedEquitiesService: UnlistedEquitiesService) {}

    @Get('products')
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        const queryParams = { page: 1, per_page: 99, ...getProductsDto };
        return this.unlistedEquitiesService.getProducts(queryParams);
    }

    @Get('products/:isin/price')
    // @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    getPrice(@Param('isin') isin: string, @Query() getPriceDto: GetPriceDto) {
        return this.unlistedEquitiesService.getPrice(isin, getPriceDto);
    }

    @Get('products/:isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.unlistedEquitiesService.getProduct(isin);
    }
}
