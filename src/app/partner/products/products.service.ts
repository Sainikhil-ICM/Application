import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import BondsService from 'src/services/bonds.service';
import * as filter from 'lodash/filter';
import GetProductsReqDto from './dto/request/get-products.req.dto';
import { ProductResDto } from './dto/response/product.res.dto';
import { ProductPriceResDto } from './dto/response/product-price.res.dto';

type ResProps = {
    success: boolean;
    error?: any;
    message?: string;
    data?: any;
};

@Injectable()
export class ProductsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly bondsService: BondsService,
    ) {}

    baseUrl = this.configService.get<string>('ICM_API_URL');

    async getProducts(params: GetProductsReqDto): Promise<ResProps> {
        const result = await this.bondsService.getProducts();

        if (result.success) {
            const queryParams = { showOnBrowse: true };

            if (params.category) {
                queryParams['category'] = params.category;
            }

            const products = filter(result.data, queryParams);

            return {
                success: true,
                data: {
                    total_count: products.length,
                    collection: products.map((product) => {
                        return new ProductResDto(product);
                    }),
                },
            };
        }

        return {
            success: false,
            message: 'Service not available, try again later.',
        };
    }

    async getProductPrice(params: {
        product_code: string;
        units: number;
        return_rate: number;
    }): Promise<ResProps> {
        const resGetProductPrice = await this.bondsService.getProductPrice(params);

        console.log(
            '🚀 ~ file: products.service.ts:57 ~ ProductssService ~ resGetProductPrice:',
            resGetProductPrice,
        );

        if (!resGetProductPrice.success) {
            return {
                success: false,
                message:
                    resGetProductPrice.message ??
                    'Product price is not available, please contact support.',
            };
        }

        return {
            success: true,
            data: new ProductPriceResDto(resGetProductPrice.data),
        };
    }

    async getProduct(product_isin: string) {
        const result = await this.bondsService.getProduct(product_isin);

        if (!result.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return {
            success: true,
            data: new ProductResDto(result.data),
        };
    }
}
