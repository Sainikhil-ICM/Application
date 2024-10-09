import { registerAs } from '@nestjs/config';

export const CVLKRA_CONFIG = registerAs('CVLKRA', () => ({
    USERNAME: process.env['USERNAME'],
    POS_CODE: process.env['POS_CODE'],
    PASSWORD: process.env['PASSWORD'],
    PASS_KEY: process.env['PASS_KEY'],
}));
