import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class AddressDetailsDto {
    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsString()
    @IsOptional()
    districtOrCity: string;

    @IsString()
    @IsOptional()
    pincode: string;

    @IsString()
    @IsOptional()
    localityOrPostOffice: string;

    @IsString()
    @IsOptional()
    country: string;
}

export class ThirdPartyCustomerDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsNotEmpty()
    pan: string;

    @IsString()
    @IsOptional()
    productName: string;

    @IsString()
    @IsOptional()
    gender: string;

    @IsString()
    @IsOptional()
    income: string;

    @IsString()
    @IsOptional()
    dob: string;

    @IsString()
    @IsOptional()
    status: string;

    @IsString()
    @IsOptional()
    demat: string;

    @IsString()
    @IsOptional()
    dpName: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    addressDocType: string;

    @IsString()
    @IsOptional()
    access_token: string;

    @IsOptional()
    addressDetails: AddressDetailsDto;

    @IsString()
    @IsOptional()
    accountNumber: string;

    @IsString()
    @IsOptional()
    ifscCode: string;

    @IsString()
    @IsOptional()
    accountType: string;

    @IsString()
    @IsOptional()
    nameInBank: string;
}
