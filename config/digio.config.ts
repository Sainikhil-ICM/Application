import { registerAs } from '@nestjs/config';

export const DIGIO_CONFIG = registerAs('DIGIO', () => ({
    API_URL: process.env['DIGIO_API_URL'],
    CLIENT_ID: process.env['DIGIO_CLIENT_ID'],
    CLIENT_SECRET: process.env['DIGIO_CLIENT_SECRET'],
    INDIVIDUAL_AOF_TEMPLATE_ID: process.env['INDIVIDUAL_AOF_TEMPLATE_ID'],
    NON_INDIVIDUAL_AOF_TEMPLATE_ID: process.env['NON_INDIVIDUAL_AOF_TEMPLATE_ID'],
}));
