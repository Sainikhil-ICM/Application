import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';

import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        HttpModule,
        MulterModule.register({
            dest: __dirname.split('/').slice(0, -1).join('/') + '/public/uploads/',
        }),
    ],
    controllers: [UploadController],
    providers: [],
})
export class UploadModule {}
