import { CustomerKycStatus, KycMode } from './customer.const';

export type SessionProduct = {
    name: string;
    code: string;
    isin: string;
    type: string;
    issuer: string;
};

export enum ProductType {
    BOND = 'BOND',
    MLD = 'MLD',
    IPO = 'IPO',
    LISTED_BOND = 'LISTED_BOND',
    UNLISTED_EQUITY = 'UNLISTED_EQUITY',
    MUTUAL_FUND = 'MUTUAL_FUND',
    REDEMPTION = 'REDEMPTION',
    SWITCH = 'SWITCH',
}

export enum ProductCategory {
    LIVE = 'live',
    UPCOMING = 'upcoming',
    HISTORICAL = 'historical',
}

export enum ProductListingCategory {
    INTERNAL = 'internal',
    EXTERNAL = 'external',
}

export enum SipFrequency {
    MONTHLY = 'MONTHLY',
}

export enum ProductListingStatus {
    LISTED = 'LISTED',
    UNLISTED = 'UNLISTED',
}

// TODO: Should this be stored in DB?
export const PRODUCTS_LISTING_KYC_ACCESS_MAP: { [key in ProductListingStatus]: KycMode[] } = {
    [ProductListingStatus.LISTED]: [KycMode.DIGILOCKER, KycMode.ONLINE, KycMode.SELF], // only full kyc modes can transact in listed products
    [ProductListingStatus.UNLISTED]: Object.values(KycMode), // any kyc mode can transact in unlisted
};
