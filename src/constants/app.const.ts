type Property = {
    name: string;
    type: string;
    description: string;
};

type Endpoint = {
    method: string;
    path: string;
    title: string;
    anchor?: string;
    description: string;
    optionalAttributes: Property[];
    requiredAttributes: Property[];
    request: {
        curl: string;
    };
    response: {
        success: boolean;
        data: any[] | object;
        message?: string;
    };
};

export type ApiResource = {
    name: string;
    path: string;
    description: string;
    title: string;
    subtitle: string;
    properties: Property[];
    endpoints: Endpoint[];
};

export enum AppEnv {
    ICVP = 'icvp',
    ICMP = 'icmp',
}

export enum PanType {
    INDIVIDUAL = 'INDIVIDUAL',
    FIRM = 'FIRM',
    COMPANY = 'COMPANY',
    HINDU_UNDIVIDED_FAMILY = 'HINDU_UNDIVIDED_FAMILY',
    ASSOCIATION_OF_PERSONS = 'ASSOCIATION_OF_PERSONS',
    BODY_OF_INDIVIDUALS = 'BODY_OF_INDIVIDUALS',
    GOVERNMENT = 'GOVERNMENT',
    ARTIFICIAL_JURIDICAL_PERSON = 'ARTIFICIAL_JURIDICAL_PERSON',
    LOCAL_AUTHORITY = 'LOCAL_AUTHORITY',
    TRUST = 'TRUST',
    UNKNOWN = 'UNKNOWN',
}

export const birthDateLabelMap = (panType: PanType) => {
    switch (panType) {
        case PanType.INDIVIDUAL:
            return 'Date of Birth';
        default:
            return 'Incorporation Date';
    }
};

export enum PartnerName {
    incredmoney = 'incredmoney',
    incredvalueplus = 'incredvalueplus',
    incredpremier = 'incredpremier',
    incredwealth = 'incredwealth',
}

export const PartnerNameMap = {
    [PartnerName.incredmoney]: 'InCred Money',
    [PartnerName.incredvalueplus]: 'InCred Value Plus',
    [PartnerName.incredpremier]: 'InCred Premier',
    [PartnerName.incredwealth]: 'InCred Wealth',
};
