import { UserDocument } from 'src/models/user.model';

export class CreateVendorDto {
    Vendor_Name: string;
    Email: string;
    City: string;

    constructor(params: Partial<UserDocument>) {
        this.Vendor_Name = params.name;
        this.Email = params.email;
        this.City = params.city;
    }
}
