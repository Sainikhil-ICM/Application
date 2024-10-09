import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from 'src/models/account.model';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/models';

@Injectable()
export class PartnerGuard implements CanActivate {
    constructor(
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiToken = this.extractTokenFromHeader(request);

        if (!apiToken) {
            throw new UnauthorizedException('Api token is required.');
        }

        try {
            const account = await this.accountModel.findOne({
                api_token: apiToken,
                // type: AccountType.MIDDLEWARE,
            });

            if (!account) {
                throw new UnauthorizedException('Api access is not enabled for this account.');
            }

            const user = await this.userModel.findOne({ account_id: account.id }).select('_id');

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['session'] = {};
            request['session']['account_id'] = account.id;
            request['session']['account_name'] = account.name;
            request['session']['account_type'] = account.type;
            request['session']['account_code'] = account.code;
            request['session']['user_api_token'] = account.user_api_token;
            request['session']['user_id'] = user._id;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
