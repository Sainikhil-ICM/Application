import { UserDocument } from 'src/models/user.model';

export class UpdateVendorDto {
    Id: string;
    Vendor_Name: string;
    Email: string;

    constructor(params: Partial<UserDocument>) {
        this.Id = params.zoho_id;
        this.Vendor_Name = params.name;
        this.Email = params.email;
    }
}
