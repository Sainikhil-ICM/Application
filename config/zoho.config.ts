import { registerAs } from '@nestjs/config';

export const ZOHO_CONFIG = registerAs('ZOHO', () => ({
    API_URL: process.env['ZOHO_API_URL'],
    ACCOUNTS_URL: process.env['ZOHO_ACCOUNTS_URL'],
    CLIENT_ID: process.env['ZOHO_CLIENT_ID'],
    CLIENT_SECRET: process.env['ZOHO_CLIENT_SECRET'],
    REFRESH_TOKEN: process.env['ZOHO_REFRESH_TOKEN'],
}));
