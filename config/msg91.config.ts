import { registerAs } from '@nestjs/config';

export const MSG91_CONFIG = registerAs('MSG91', () => ({
    BASE_URL: process.env['MSG91_BASE_URL'],
    AUTH_KEY: process.env['MSG91_AUTH_KEY'],
}));
