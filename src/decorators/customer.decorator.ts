import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Customer = createParamDecorator((_data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.customer ?? null;
});
