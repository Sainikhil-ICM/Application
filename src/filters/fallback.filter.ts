import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        console.log('🚀 ~ FallbackExceptionFilter ~ exception:', exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        response.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            path: `${request.method} https://${request.hostname}${request.url}`,
            error: 'FallbackExceptionFilter',
            message: exception.message ? exception.message : 'Unexpected error ocurred',
            data: exception.response?.data,
        });
    }
}
