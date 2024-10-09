import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const statusCode = exception.getStatus();
        const data = exception.getResponse() as any;

        this.logger.warn(`${statusCode} ${exception.message}`);

        response.status(statusCode).json({
            success: false,
            timestamp: new Date().toISOString(),
            path: `${request.method} https://${request.hostname}${request.url}`,
            error: data?.error ?? 'Http Exception Filter',
            message: exception.message,
        });
    }
}
