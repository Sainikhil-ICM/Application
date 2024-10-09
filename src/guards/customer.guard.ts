import { Model, Types } from 'mongoose';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

import { Customer, CustomerDocument } from 'src/models';

@Injectable()
export class CustomerGuard implements CanActivate {
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const secret = this.configService.get<string>('JWT.SECRET');
            const payload = await this.jwtService.verifyAsync(token, { secret });

            const { customer_id, sub } = payload;
            const customer = await this.customerModel.findById(customer_id);

            if (!customer) {
                throw new UnauthorizedException();
            }

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['customer'] = {};
            request['customer']['customer_id'] = new Types.ObjectId(customer_id);
            request['customer']['sub'] = sub;
        } catch (error) {
            console.log('🚀 ~ AuthGuard ~ canActivate ~ error:', error);
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
