import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { DematType } from 'src/constants/customer.const';
import { CustomerProfile, CustomerProfileDocument } from 'src/models/customer-profile.model';
import { Customer, CustomerDocument } from 'src/models/customer.model';
import BondsService from 'src/services/bonds.service';

@Injectable()
export class ValidateDematMiddleware implements NestMiddleware {
    constructor(
        private bondsService: BondsService,
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerProfile.name)
        private customerProfileModel: Model<CustomerProfileDocument>,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        console.log('validate demat middleware', req);
        const full_demat_number =
            req.body?.bank_account?.demat_account_number || req.body?.demat_number;
        const demat_number = full_demat_number?.substring(0, 8);
        let customer_id = req.body?.customer_id;

        if (!demat_number) {
            return next(); // If no demat_number is provided, proceed to the next middleware
        }

        if (!customer_id) {
            const customerProfile = await this.customerProfileModel.findOne({
                pan_number: req.body.pan_number,
            });

            if (customerProfile?.customer_id) customer_id = customerProfile.customer_id;
            else return next();
        }

        const customer = await this.customerModel.findOne({ _id: customer_id });

        const access = await this.bondsService.refreshToken(customer);

        const axiosResponse = await this.bondsService.validateDematNumber(
            demat_number,
            access.data.token,
        );

        await this.customerProfileModel.findOneAndUpdate(
            {
                customer_id,
            },
            {
                demat_account: {
                    number: full_demat_number,
                    dp_id: axiosResponse.data?.[0]?.dpId,
                    broker: axiosResponse.data?.[0]?.dpName,
                    client_id: full_demat_number.split(axiosResponse.data?.[0]?.dpId)[1],
                    demat_type: full_demat_number.startsWith('IN')
                        ? DematType.NSDL
                        : DematType.CDSL,
                },
            },
            { upsert: true },
        );

        console.log(
            '🚀 ~ Customer Middleware ~ validateDematNumber ~ response:',
            axiosResponse,
            req.body,
        );

        if (axiosResponse.success) {
            return next(); // Allow access if it's valid
        } else {
            res.json({
                success: false,
                error: 'ValidationFilter',
                data: [
                    {
                        name: 'demat_number',
                        message: 'Invalid demat number',
                    },
                ],
            });
        }
    }
}
