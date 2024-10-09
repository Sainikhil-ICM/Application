import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Product = createParamDecorator((_data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.product ?? null;
});
