import { NestFactory } from '@nestjs/core';
import { ValidationError, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
import { HttpExceptionFilter } from './filters/http.filter';
import { FallbackExceptionFilter } from './filters/fallback.filter';
import { ValidationFilter } from './filters/validation.filter';
import { ValidationException } from './filters/validation.exception';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpService } from '@nestjs/axios';
import getCurlString from './helpers/curlize.helper';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    // app.enableCors({
    //     // origin: 'https://uat.advisor.incredmoney.com',
    //     // origin: ['/incredmoney.com$/'],
    //     // origin: '*',
    //     origin: function (req, callback) {
    //         console.log('🚀 ~ file: main.ts:25 ~ bootstrap ~ req:', req);
    //         return callback(null, true);
    //     },
    //     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    //     preflightContinue: false,
    //     optionsSuccessStatus: 204,
    // });

    // Mongoose with bluebird
    (<any>mongoose).Promise = bluebird;
    mongoose.set('debug', true);

    // app.useGlobalInterceptors(new TransformInterceptor());

    app.setGlobalPrefix('v1');

    app.useGlobalFilters(
        new FallbackExceptionFilter(),
        new HttpExceptionFilter(),
        new ValidationFilter(),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            skipMissingProperties: true,
            exceptionFactory: (errors: ValidationError[]) => {
                console.log('errors', errors);
                const messages = errors.map(
                    (error) =>
                        `${error.property} has wrong value ${error.value}, ${Object.values(
                            error.constraints,
                        ).join(', ')}`,
                );

                return new ValidationException(messages);
            },
        }),
    );

    // TODO: Remove this on production
    const httpService = new HttpService();

    httpService.axiosRef.interceptors.request.use((request) => {
        const curlRequest = getCurlString(request);
        console.log('🚀 ~ curlRequest:', curlRequest);
        return request;
    }, Promise.reject);

    await app.listen(3000);
}
bootstrap();
