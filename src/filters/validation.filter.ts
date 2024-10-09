import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ValidationException } from './validation.exception';
import { Request, Response } from 'express';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
    catch(exception: ValidationException, host: ArgumentsHost): any {
        console.log('🚀 ~ ValidationFilter ~ exception:', exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        return response.status(400).json({
            success: false,
            // timestamp: new Date().toISOString(),
            // path: `${request.method} https://${request.hostname}${request.url}`,
            message: 'Validation failed, please check the errors.',
            errors: exception.validationErrors,
        });
    }
}

// import {
//     ArgumentsHost,
//     Catch,
//     ExceptionFilter,
//     RpcExceptionFilter,
// } from '@nestjs/common';
// import { MongoError } from 'mongodb';
// import { Error } from 'mongoose';
// import ValidationError = Error.ValidationError;

// @Catch(MongoError)
// export class MongoExceptionFilter implements ExceptionFilter {
//     catch(exception: MongoError, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse();

//         return response.status(400).json({
//             statusCode: 400,
//             createdBy: 'ValidationErrorFilter',
//             errorMessage: exception,
//         });
//     }
// }

// @Catch(ValidationError)
// export class ValidationErrorFilter implements RpcExceptionFilter {
//     catch(exception: ValidationError, host: ArgumentsHost): any {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse();

//         return response.status(400).json({
//             statusCode: 400,
//             createdBy: 'ValidationErrorFilter',
//             errors: exception.errors,
//         });
//     }
// }
