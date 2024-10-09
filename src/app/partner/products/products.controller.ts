import {
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import GetProductsReqDto from './dto/request/get-products.req.dto';
import { PartnerGuard } from 'src/guards/partner.guard';
import { GetProductPriceReqDto } from './dto/request/get-product-price.res.dto';

@Controller('partner/products')
@UseGuards(PartnerGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() query: GetProductsReqDto) {
        return this.productsService.getProducts(query);
    }

    @Get(':product_code/price')
    @UseInterceptors(ClassSerializerInterceptor)
    getProductPrice(
        @Param('product_code') product_code: string,
        @Query() query: GetProductPriceReqDto,
    ) {
        return this.productsService.getProductPrice({
            ...query,
            product_code,
        });
    }

    @Get(':product_isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('product_isin') product_isin: string) {
        return this.productsService.getProduct(product_isin);
    }
}
