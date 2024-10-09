import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import BondsService from 'src/services/bonds.service';

@Injectable()
export class IsProductLiveMiddleware implements NestMiddleware {
    constructor(private bondsService: BondsService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await this.bondsService.getProduct(req.body.product_isin);

            if (product.data.category !== 'live') {
                return res.json({
                    success: false,
                    message: 'Product is not live.',
                });
            }

            req['product'] = {};
            req['product']['code'] = product.data.product;
            req['product']['name'] = product.data.productName;
            req['product']['isin'] = product.data.ISIN;
            req['product']['type'] = product.data.productType;
            req['product']['issuer'] = product.data.issuer;

            next();
        } catch (error) {
            console.log('🚀 ~ IsProductLiveMiddleware ~ error:', error);

            return res.json({
                success: false,
                message: 'Service not available, please try again.',
            });
        }
    }
}
