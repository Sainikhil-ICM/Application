export enum AumCategory {
    LESS_THAN_1CR = 'LESS_THAN_1CR',
    '1CR_TO_5CR' = '1CR_TO_5CR',
    '5CR_TO_15CR' = '5CR_TO_15CR',
    MORE_THAN_15CR = 'MORE_THAN_15CR',
}

export enum UserProfileStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
}
export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

export enum UtmMedium {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    WEBSITE = 'WEBSITE',
    FACEBOOK = 'FACEBOOK',
    LINKEDIN = 'LINKEDIN',
    TWITTER = 'TWITTER',
    INSTAGRAM = 'INSTAGRAM',
    YOUTUBE = 'YOUTUBE',
    GOOGLE = 'GOOGLE',
    OTHERS = 'OTHERS',
}

export enum ClientBase {
    ALL = 'ALL',
    RETAIL = 'RETAIL',
    HIGH_NETWORTH_INDIVIDUAL = 'HIGH_NETWORTH_INDIVIDUAL',
    ULTRA_HIGH_NETWORTH_INDIVIDUAL = 'ULTRA_HIGH_NETWORTH_INDIVIDUAL',
    CORPORATE = 'CORPORATE',
    INSTITUTIONAL = 'INSTITUTIONAL',
}

export enum ProductType {
    ALL = 'ALL',
    MUTUAL_FUND = 'MUTUAL_FUND',
    LISTED_BOND = 'LISTED_BOND',
    UNLISTED_BOND = 'UNLISTED_BOND',
    INSURANCE = 'INSURANCE',
    MARKET_LINKED_DEBENTURE = 'MARKET_LINKED_DEBENTURE',
    PORTFOLIO_MANAGEMENT_SERVICE = 'PORTFOLIO_MANAGEMENT_SERVICE',
    ALTERNATIVE_INVESTMENT_FUND = 'ALTERNATIVE_INVESTMENT_FUND',
    REAL_ESTATE_INVESTMENT_TRUST = 'REAL_ESTATE_INVESTMENT_TRUST',
    INFRASTRUCTURE_INVESTMENT_TRUST = 'INFRASTRUCTURE_INVESTMENT_TRUST',
    LIBERALISED_REMITTANCE_SCHEME = 'LIBERALISED_REMITTANCE_SCHEME',
    CORPORATE_FIXED_DEPOSIT = 'CORPORATE_FIXED_DEPOSIT',
}

export enum RelationType {
    FATHER = 'FATHER',
    MOTHER = 'MOTHER',
    DAUGHTER = 'DAUGHTER',
    SON = 'SON',
    WIFE = 'WIFE',
    GRANDSON = 'GRANDSON',
    OTHERS = 'OTHERS',
}

export enum GrossAnnualIncome {
    LESS_THAN_10L = 'LESS_THAN_10L',
    '10L_TO_50L' = '10L_TO_50L',
    '50L_TO_1CR' = '50L_TO_1CR',
    MORE_THAN_1CR = 'MORE_THAN_1CR',
}

export enum UserProfileType {
    INDIVIDUAL = 'INDIVIDUAL',
    NON_INDIVIDUAL = 'NON_INDIVIDUAL',
}
