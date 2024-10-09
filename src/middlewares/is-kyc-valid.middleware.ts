import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { ValidateCustomerDto } from 'src/app/backend/customers/dto/validate-customer.dto';
import { CustomerProfile, CustomerProfileDocument } from 'src/models/customer-profile.model';
import { Customer, CustomerDocument } from 'src/models/customer.model';
import AttachmentService from 'src/services/attachment.service';
import BondsService from 'src/services/bonds.service';

@Injectable()
export class ValidateCustomerKycMiddleware implements NestMiddleware {
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        @InjectModel(CustomerProfile.name)
        private readonly customerProfileModel: Model<CustomerProfileDocument>,
        private readonly attachmentService: AttachmentService,
        private readonly bondsService: BondsService,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const customer_id = req.params.id;

        const isValid = await this.isCustomerDetailsValid(customer_id);

        if (isValid) {
            next();
        } else {
            return res.json({
                success: false,
                message: 'Customer Details are missing',
            });
        }
    }

    private async isCustomerDetailsValid(customer_id: string): Promise<boolean> {
        const customer = await this.customerModel.findOne({ _id: customer_id });
        const customerProfile = await this.customerProfileModel.findOne({ customer_id });

        const attachments = await this.attachmentService.getCustomerAttachments(customer_id);
        const customerDocsB2C = await this.bondsService.getCustomerDocs(customer.pan_number);

        if (!customer) {
            return false;
        }

        try {
            const customerDto = plainToClass(ValidateCustomerDto, {
                ...customer.toObject(),

                address: customerProfile?.correspondance_address?.line_1 ?? customer.address,
                city: customerProfile?.correspondance_address?.city ?? customer.city,
                state: customerProfile?.correspondance_address?.state ?? customer.state,
                pincode: customerProfile?.correspondance_address?.pin_code ?? customer.pincode,
                country: customerProfile?.correspondance_address?.country ?? customer.country,

                account_type: customerProfile?.bank_account?.type ?? customer.account_type,
                account_number: customerProfile?.bank_account?.number ?? customer.account_number,
                ifsc_code: customerProfile?.bank_account?.ifsc_code ?? customer.ifsc_code,
                is_bank_verified:
                    customer.is_bank_verified ??
                    !customerProfile?.documents?.cancelled_cheque ??
                    false,
                is_penny_dropped:
                    customer.is_penny_dropped ??
                    !customerProfile?.documents?.cancelled_cheque ??
                    false,
                is_consent_given: customer.is_consent_given ?? false,
            });

            // Validate the customer DTO
            const errors = await validate(customerDto);
            console.log(errors, 'here');
            if (errors.length > 0) {
                return false; // Validation failed
            } else {
                if (customerDocsB2C?.data?.length >= 3) {
                    return true;
                }
                if (attachments.length < 2) {
                    return false;
                }
                if (
                    customer?.is_bank_verified === false &&
                    !attachments?.some((attachment) => attachment.type === 'CANCELLED_CHEQUE')
                ) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.log(error, 'here2');
            return false;
        }
    }
}
