import { registerAs } from '@nestjs/config';

export const DATABASE_CONFIG = registerAs('DATABASE', () => ({
    USER: process.env['DATABASE_USER'],
    PASSWORD: process.env['DATABASE_PASSWORD'],
    NAME: process.env['DATABASE_NAME'],
    HOST: process.env['DATABASE_HOST'],
    PORT: process.env['DATABASE_PORT'],
    get url() {
        return `mongodb+srv://${this.USER}:${this.PASSWORD}@${this.HOST}/${this.NAME}?retryWrites=true&w=majority`;
    },
}));
