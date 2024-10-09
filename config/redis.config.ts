import { registerAs } from '@nestjs/config';

export const REDIS_CONFIG = registerAs('REDIS', () => ({
    HOST: process.env['REDIS_HOST'],
    PORT: process.env['REDIS_PORT'],
}));
