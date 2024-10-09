import {
    IsNumber,
    IsString,
    IsOptional,
    IsBoolean,
    IsDate,
    IsEnum,
    IsArray,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PgDto {
    @IsString()
    callbackURL: string;

    @IsString()
    oroAccount: string;

    @IsString()
    redirectURL: string;

    @IsString()
    contactUrl: string;

    @IsString()
    addFundAccUrl: string;
}

class DigioDto {
    @IsString()
    templateId: string;

    @IsString()
    cin: string;

    @IsString()
    debentureTrustee: string;

    @IsEnum(['NSDL', 'CDSL'])
    depository: string;

    @IsNumber()
    expiryInDays: number;

    @IsString()
    issuer: string;

    @IsString()
    message: string;

    @IsString()
    modeOfIssue: string;

    @IsString()
    securityDetails: string;

    @IsString()
    @IsOptional()
    sellerClientId?: string;

    @IsString()
    @IsOptional()
    sellerDepository?: string;

    @IsString()
    @IsOptional()
    sellerDpID?: string;

    @IsString()
    @IsOptional()
    sellerDpName?: string;

    @IsString()
    @IsOptional()
    sellerName?: string;

    @IsString()
    @IsOptional()
    sellerSignatureText?: string;
}

class HighlightsDto {
    @IsString()
    web: string;

    @IsString()
    text: string;
}

class LenderIconsDto {
    @IsString()
    imageUrl: string;

    @IsString()
    @IsOptional()
    title?: string;
}

export class CreateProductDto {
    @IsNumber()
    order: number;

    @IsString()
    ISIN: string;

    @IsString()
    trueISIN?: string;

    @IsString()
    product: string;

    @IsString()
    fundId?: string;

    @IsString()
    bondId?: string;

    @IsString()
    issueDate?: string;

    @IsNumber()
    @IsOptional()
    minAmt?: number;

    @IsNumber()
    @IsOptional()
    maxAmt?: number;

    @IsNumber()
    @IsOptional()
    issueSize?: number;

    @IsString()
    @IsOptional()
    soldOutTxt?: string;

    @IsNumber()
    @IsOptional()
    minTenure?: number;

    @IsNumber()
    @IsOptional()
    maxTenure?: number;

    @IsString()
    @IsOptional()
    tenureRangeTxt?: string;

    @IsString()
    @IsOptional()
    rating?: string;

    @IsString()
    listing: string = 'monthly';

    @IsNumber()
    @IsOptional()
    issuePrice?: number;

    @IsString()
    couponType: string = 'monthly';

    @IsString()
    @IsOptional()
    maturityDate?: string;

    @IsString()
    @IsOptional()
    xirr?: string;

    @IsString()
    @IsOptional()
    issuer?: string;

    @ValidateNested()
    @Type(() => PgDto)
    pg: PgDto;

    @ValidateNested()
    @Type(() => DigioDto)
    digio: DigioDto;

    @IsOptional()
    comms?: { waMediaURL: string };

    @IsString()
    issueCategory: 'secured' | 'unsecured';

    @IsString()
    issueType: 'public' | 'private';

    @IsString()
    taxSaving: 'yes' | 'no';

    @IsBoolean()
    isActive?: boolean;

    @IsEnum(['historical', 'upcoming', 'live'])
    category: 'historical' | 'upcoming' | 'live';

    @IsNumber()
    faceValue: number;

    @IsNumber()
    couponRate: number;

    @IsBoolean()
    xirrPriceForUser?: boolean;

    @IsNumber()
    minReturns: number;

    @IsNumber()
    maxReturns: number;

    @IsNumber()
    multiplier: number;

    @IsEnum(['bonds', 'mld', 'ipo'])
    productType: 'bonds' | 'mld' | 'ipo';

    @IsOptional()
    companyFinancialsLink?: any;

    @IsOptional()
    companyPresentationLink?: any;

    @IsOptional()
    productInfoMemorandum?: any;

    @IsBoolean()
    priceIsLive: boolean = false;

    @IsNumber()
    exitLoadInPerc: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HighlightsDto)
    highlights: HighlightsDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LenderIconsDto)
    lenderIcons: LenderIconsDto[];

    @IsOptional()
    securityCover?: any;

    @IsOptional()
    aum?: any;

    @IsOptional()
    netWorth?: any;

    @IsOptional()
    marketCap?: any;

    @IsOptional()
    profitAfterTax?: any;

    @IsOptional()
    gnpa?: any;

    @IsOptional()
    debtEquityRatio?: any;

    @IsString()
    openDate: string;

    @IsDate()
    @Type(() => Date)
    @Type(() => Date)
    closeDate: Date;

    @IsString()
    marketStartTime?: string;

    @IsString()
    marketEndTime?: string;

    @IsOptional()
    marketingGifBanner?: any;

    @IsNumber()
    minUnits: number;

    @IsNumber()
    stepSize: number;

    // @IsNumber()
    // tds: number;

    @IsOptional()
    nnpa?: any;

    @IsString()
    baseXirr?: string;

    @IsString()
    minXirrDeviation?: string;

    @IsString()
    maxXirrDeviation?: string;

    @IsNumber()
    issuerFaceValue: number;

    @IsEnum(['internal', 'external'])
    listingCategory: 'internal' | 'external' = 'internal';
}
