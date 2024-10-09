import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isMongoId } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { Model } from 'mongoose';
import { CustomerKycStatus } from 'src/constants/customer.const';
import { ConnectionType, Customer, CustomerDocument } from 'src/models/customer.model';

@Injectable()
export class IsCustomerValidMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<CustomerDocument>,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            if (!isMongoId(req.body.customer_id)) {
                return res.json({
                    success: false,
                    message: 'Invalid customer id.',
                });
            }

            const customer = await this.customerModel
                .findOne({ _id: req.body.customer_id })
                .select('name email status demat_number pan_number connections');

            if (!customer) {
                return res.json({
                    success: false,
                    message: 'Customer not found.',
                });
            }

            if (
                customer.getConnectionValue(ConnectionType.ICM, 'kyc_status') !==
                    CustomerKycStatus.KYC_VERIFIED &&
                customer.getConnectionValue(ConnectionType.BIDD, 'kyc_status') !==
                    CustomerKycStatus.KYC_VERIFIED
            ) {
                return res.json({
                    success: false,
                    message: 'Customer is not KYC verified.',
                });
            }

            // This can be extracted from the customer decorator
            req['customer'] = customer;
            next();
        } catch (error) {
            console.log('🚀 ~ IsCustomerValidMiddleware ~ error:', error);

            return res.json({
                success: false,
                message: 'Service not available, please try again.',
            });
        }
    }
}
