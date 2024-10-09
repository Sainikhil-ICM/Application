import { registerAs } from '@nestjs/config';

export const AWS_CONFIG = registerAs('AWS', () => ({
    // AWS S3
    S3_BASE_URL: process.env['S3_BASE_URL'],
    S3_REGION: process.env['S3_REGION'],
    S3_BUCKET: process.env['S3_BUCKET'],

    // AWS PARTNER
    PARTNER_ACCESS_KEY_ID: process.env['PARTNER_ACCESS_KEY_ID'],
    PARTNER_SECRET_ACCESS_KEY: process.env['PARTNER_SECRET_ACCESS_KEY'],
    PARTNER_SES_REGION: process.env['PARTNER_SES_REGION'],
    PARTNER_SES_FROM_EMAIL: process.env['PARTNER_SES_FROM_EMAIL'],

    // AWS BIDD
    BIDD_ACCESS_KEY_ID: process.env['BIDD_ACCESS_KEY_ID'],
    BIDD_SECRET_ACCESS_KEY: process.env['BIDD_SECRET_ACCESS_KEY'],
    BIDD_SES_REGION: process.env['BIDD_SES_REGION'],
    BIDD_SES_FROM_EMAIL: process.env['BIDD_SES_FROM_EMAIL'],
}));
