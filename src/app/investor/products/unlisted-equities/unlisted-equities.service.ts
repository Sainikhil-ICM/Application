import { Injectable } from '@nestjs/common';
import * as filter from 'lodash/filter';

import { ResProps } from 'src/constants/constants';

import GetPriceDto from './dto/get-price.dto';
import GetProductsDto from './dto/get-products.dto';

import UnlistedEquityService from 'src/services/unlisted-equity/unlisted-equity.service';

import { UnlistedEquityPresenter } from './presenters/unlisted-equity.presenter';
import { UnlistedEquityPricePresenter } from './presenters/unlisted-equity-price-presenter';
import { GetPriceDmo } from 'src/services/unlisted-equity/dto/get-price.dmo';

@Injectable()
export class UnlistedEquitiesService {
    constructor(private readonly unlistedEquityService: UnlistedEquityService) {}

    async getProducts(getProductsDto: GetProductsDto): Promise<ResProps> {
        const resGetUnlistedEquities = await this.unlistedEquityService.getUnlistedEquities();

        if (resGetUnlistedEquities.success) {
            const queryParams = { showOnBrowse: true };

            if (getProductsDto.category) {
                queryParams['category'] = getProductsDto.category;
            }

            const products = filter(resGetUnlistedEquities.data, queryParams);

            return {
                success: true,
                data: {
                    total_count: products.length,
                    collection: products.map((product) => {
                        return new UnlistedEquityPresenter(product);
                    }),
                },
            };
        }

        return {
            success: false,
            message: 'Service not available, try again later.',
        };
    }

    async getPrice(isin: string, getPriceDto: GetPriceDto): Promise<ResProps> {
        const resGetUnlistedEquityPrice = await this.unlistedEquityService
            // Keeping code in multiple lines.
            .getPrice(
                new GetPriceDmo({
                    isin: isin,
                    trade_date: getPriceDto.trade_date,
                    units: getPriceDto.units,
                }),
            );

        if (!resGetUnlistedEquityPrice.success) {
            return {
                success: false,
                message: 'Service not available, try again later.',
            };
        }

        return {
            success: true,
            data: new UnlistedEquityPricePresenter(resGetUnlistedEquityPrice.data),
        };
    }

    async getProduct(isin: string) {
        const resGetProduct = await this.unlistedEquityService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return {
            success: true,
            data: new UnlistedEquityPresenter(resGetProduct.data),
        };
    }
}
