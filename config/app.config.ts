export const APP_CONFIG = () => ({
    APP_NAME: process.env['APP_NAME'],
    APP_URL: process.env['APP_URL'],
    CLIENT_URL: process.env['CLIENT_URL'],
    PARTNER_NAME: process.env['PARTNER_NAME'],

    ICM_API_URL: process.env['ICM_API_URL'],
    ICM_CLIENT_URL: process.env['ICM_CLIENT_URL'],

    BIDD_API_URL: process.env['BIDD_API_URL'],
    BIDD_CLIENT_URL: process.env['BIDD_CLIENT_URL'],

    OPS_ADMIN_ACCESS_TOKEN: process.env['OPS_ADMIN_ACCESS_TOKEN'],
    API_URL: process.env['API_URL'],
    EMAIL: {
        SUPPORT: process.env['SUPPORT_EMAIL'],
    },
    APP_PROT: process.env['APP_PROT'],
    APP_ENV: process.env['APP_ENV'],
    ICM_PARTNER_ID: process.env['ICM_PARTNER_ID'],
    isProd: process.env['NODE_ENV'] === 'production',
    MUTUAL_FUNDS_API_URL: process.env['MUTUAL_FUNDS_API_URL'],
    MUTUAL_FUNDS_AUTH_KEY: process.env['MUTUAL_FUNDS_AUTH_KEY'],
    MUTUAL_FUNDS_ACCESS_TOKEN: process.env['MUTUAL_FUNDS_ACCESS_TOKEN'],
    MUTUAL_FUNDS_JWT_SECRET: process.env['MUTUAL_FUNDS_JWT_SECRET'],
    CRYPTO_PASSWORD_KEY: process.env['CRYPTO_PASSWORD_KEY'],

    HYPER_VERGE_APP_ID: process.env['HYPER_VERGE_APP_ID'],
    HYPER_VERGE_APP_KEY: process.env['HYPER_VERGE_APP_KEY'],

    PDF_CONVERTER_SERVICE_URL: process.env['PDF_CONVERTER_SERVICE_URL'],
});
