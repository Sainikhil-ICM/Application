import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        return true;
        // const roles = this.reflector.get(Roles, context.getHandler());
        // if (!roles) {
        //     return true;
        // }
        // const request = context.switchToHttp().getRequest();
        // const user = request.user;
        // return matchRoles(roles, user.roles);
    }
}
