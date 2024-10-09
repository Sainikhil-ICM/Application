export enum ResourceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum ResourceCategory {
    AMC = 'AMC',
    PMS = 'PMS',
    AIF = 'AIF',
    FIXED_DEPOSIT_BOND = 'Fixed Deposit / Bond',
    VIDEOS = 'Videos',
    BUSINESS_DEVELOPMENT_TOOLS = 'Business Development Tools',
    PROCESS_NOTE = 'Process Note',
    MARKET_LINKED_DEBENTURE = 'Market Linked Debenture (MLD)',
    UNLISTED_SHARES_BONDS = 'Unlisted Shares/Bonds',
    CIRCULARS_NOTIFICATIONS = 'Circulars & Notifications',
}

export enum ResourceSubCategory {
    SID = 'SID',
    FACTSHEET = 'Factsheet',
    PMS_FACTSHEET = 'PMS Factsheet',
    PMS_PRESENTATION = 'PMS Presentation',
    AIF_FACTSHEET = 'AIF Factsheet',
    AIF_PRESENTATION = 'AIF Presentation',
    INTEREST_RATE = 'Interest Rate',
    FORM = 'Form',
    TRAINING = 'Training',
    TESTIMONIALS = 'Testimonials',
    INCRED_VALUE_PLUS = 'Incred Value Plus',
    AMC = 'AMC',
    RESEARCH_REPORTS = 'Research Reports',
    PRESENTATIONS = 'Presentations',
    VIDEOS = 'Videos',
    DEAL_SLIPS = 'Deal Slips',
}

export const resourceCategoryMap: {
    [key: string]: string[];
} = {
    AMC: ['SID', 'Factsheet'],
    PMS: ['PMS Factsheet', 'PMS Presentation'],
    AIF: ['AIF Factsheet', 'AIF Presentation'],
    'Fixed Deposit / Bond': ['Interest Rate', 'Form'],
    Videos: ['Training', 'Testimonials', 'Incred Value Plus', 'AMC'],
    'Business Development Tools': ['Research Reports'],
    'Process Note': [],
    'Market Linked Debenture (MLD)': ['Presentations', 'Videos', 'Deal Slips'],
    'Unlisted Shares/Bonds': ['Presentations', 'Videos', 'Deal Slips'],
    'Circulars & Notifications': [],
};

export enum ResourceType {
    DOCUMENT = 'DOCUMENT',
    LINK = 'LINK',
}
