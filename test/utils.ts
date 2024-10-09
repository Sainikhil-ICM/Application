import { MongooseModuleOptions, MongooseModule } from '@nestjs/mongoose';
import { ReadStream } from 'fs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { FileType } from 'src/constants/attachment.const';
import UploadService from 'src/services/upload.service';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
    MongooseModule.forRootAsync({
        useFactory: async () => {
            mongod = await MongoMemoryServer.create();
            const mongoUri = mongod.getUri();
            return {
                uri: mongoUri,
                ...options,
            };
        },
    });
export const closeInMongodConnection = async () => {
    if (mongod) {
        await mongod.stop();
    }
};

export const MockUploadService = {
    provide: UploadService,
    useValue: {
        uploadFile: jest.fn(
            async (path: string, file: Express.Multer.File | FileType): Promise<any> => {
                return {
                    $metadata: {
                        httpStatusCode: 200,
                        requestId: 'asfkhaskj',
                        extendedRequestId: 'afkjaskjdh',
                        attempts: 1,
                        totalRetryDelay: 0,
                    },
                    ETag: 'alsfjkhsajf',
                    ServerSideEncryption: 'AES256',
                };
            },
        ),
        downloadFile: jest.fn(async (): Promise<ReadStream> => {
            return new ReadStream();
        }),
    },
};
