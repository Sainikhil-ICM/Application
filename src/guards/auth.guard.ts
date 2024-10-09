import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from 'src/models';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
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

            const { user_id, account_id, role } = payload;
            const actl = await this.userModel.findOne({ account_id, _id: user_id });
            // console.log('🚀 ~ file: auth.guard.ts:40 ~ AuthGuard ~ canActivate ~ actl:', actl);

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = {};
            request['user']['user_id'] = new Types.ObjectId(user_id);
            request['user']['account_id'] = new Types.ObjectId(account_id);
            request['user']['roles'] = actl.access_controls;
            request['user']['role'] = role;
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
