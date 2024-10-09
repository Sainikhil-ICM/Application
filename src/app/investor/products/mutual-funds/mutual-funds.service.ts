import { Injectable } from '@nestjs/common';

import { ResProps } from 'src/constants/constants';

import GetProductsDto from './dto/get-products.dto';

import { MutualFundPresenter } from './presenters/mutual-fund.presenter';
import { MutualFundAssetPresenter } from './presenters/mutual-fund-asset.presenter';

import MutualFundService from 'src/services/mutual-fund/mutual-fund.service';

@Injectable()
export class MutualFundsService {
    constructor(private readonly mutualFundService: MutualFundService) {}

    async getProducts(getProductsDto: GetProductsDto): Promise<ResProps> {
        const resGetProducts = await this.mutualFundService.getProducts(getProductsDto);

        if (resGetProducts.success) {
            return {
                success: true,
                data: {
                    total_count: resGetProducts.data.length,
                    collection: resGetProducts.data.map((product) => {
                        return new MutualFundPresenter(product);
                    }),
                },
            };
        }

        return {
            success: false,
            message: 'Service not available, try again later.',
        };
    }

    async getProduct(isin: string) {
        const resGetProduct = await this.mutualFundService.getProduct(isin);

        if (!resGetProduct.success) {
            return {
                success: false,
                message: 'Product not found.',
            };
        }

        return {
            success: true,
            data: new MutualFundAssetPresenter(resGetProduct.data),
        };
    }

    async getNavData(amfi_code: string, previous: number): Promise<ResProps> {
        const chartAllNav = await this.mutualFundService.getMutualFundNav(amfi_code, previous);

        if (!chartAllNav.success) {
            return {
                success: false,
                message: chartAllNav.message || 'Navs chart fetching failed.',
            };
        }

        return {
            success: true,
            data: chartAllNav.data,
            message: 'Navs chart fetched successfully.',
        };
    }

    async getSipDates(isin: string): Promise<ResProps> {
        const resSipDates = await this.mutualFundService.getMutualFundSipDates(isin);

        if (!resSipDates.success) {
            return {
                success: false,
                message: 'Service not available, try again later.',
            };
        }

        return {
            success: true,
            data: resSipDates.data,
        };
    }
}
