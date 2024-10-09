import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { Hash } from '@smithy/hash-node';
import { parseUrl } from '@smithy/url-parser';
import { HttpRequest } from '@smithy/protocol-http';
import { formatUrl } from '@aws-sdk/util-format-url';
import { Readable } from 'stream';
import { FileType } from 'src/constants/attachment.const';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export default class UploadService {
    constructor(private readonly configService: ConfigService) {}

    s3Region = this.configService.get<string>('AWS.S3_REGION');
    s3Bucket = this.configService.get<string>('AWS.S3_BUCKET');
    accessKeyId = this.configService.get<string>('AWS.PARTNER_ACCESS_KEY_ID');
    secretAccessKey = this.configService.get<string>('AWS.PARTNER_SECRET_ACCESS_KEY');

    // Create SES service object.
    private readonly s3Client = new S3Client({
        region: this.s3Region,
        credentials: {
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
        },
    });

    // Initialize the S3RequestPresigner with your S3 client
    preSigner = new S3RequestPresigner({
        credentials: {
            accessKeyId: this.accessKeyId,
            secretAccessKey: this.secretAccessKey,
        },
        region: this.s3Region,
        sha256: Hash.bind(null, 'sha256'),
    });

    async uploadFile(path: string, file: Express.Multer.File | FileType): Promise<any> {
        try {
            return this.s3Client.send(
                new PutObjectCommand({
                    Key: [path, file.originalname].join('/'),
                    Body: file.buffer,
                    Bucket: this.s3Bucket,
                    ContentType: file.mimetype,
                }),
            );
        } catch (error) {
            console.log('🚀 ~ UploadService ~ uploadFile ~ error:', error);
            throw new ServiceUnavailableException('Could not upload the file.');
        }
    }

    /**
     * Downloades the docs from s3 link to local server
     * @param fileUrl string
     * @param location string
     *
     */
    async downloadFile(fileUrl: string): Promise<Readable> {
        const response = await axios.get(fileUrl, { responseType: 'stream' });
        const fileData = response.data;
        return fileData;
    }

    async getPreSignedUrl(location: string, validitySeconds = 900) {
        const httpRequest = new HttpRequest(parseUrl(location));
        const signedUrlObject = await this.preSigner.presign(httpRequest, {
            expiresIn: validitySeconds,
        });

        return formatUrl(signedUrlObject);
    }
}
