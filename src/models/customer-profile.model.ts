import { HydratedDocument, ObjectId, SchemaTypes, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory, raw } from '@nestjs/mongoose';
import { NomineeRelation } from 'src/app/backend/customers/dto/submit-onboarding-kyc.dto';
import {
    Gender,
    MaritalStatus,
    CitizenshipStatus,
    IncomeCategory,
    InstitutionType,
    ProofOfIdentity,
    RelatedPartyType,
    ResidentialStatus,
    NatureOfBusiness,
    BankAccountType,
    UltimateBeneficialOwnerType,
    DematType,
    AddressProofType,
    KycMode,
    CustomerProfileType,
    BeneficialOwnerRelation,
    CompanyAddressType,
} from 'src/constants/customer.const';
import { UserProfileType } from 'src/constants/user-profile.const';

@SchemaOptions()
export class NomineeGuardian {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    pan_number?: string;

    @Prop({ type: String })
    relation: string;

    @Prop({ type: String })
    birth_date: string;
}

@SchemaOptions()
class Nominee {
    @Prop({ type: String })
    name: string;

    @Prop({ type: Date })
    birth_date: string;

    @Prop({ type: String })
    allocation: string;

    @Prop({ type: String, enum: NomineeRelation })
    relation: NomineeRelation;

    @Prop({ type: String })
    other_relation?: string;

    @Prop({ type: NomineeGuardian, _id: false })
    guardian?: NomineeGuardian;
}

@SchemaOptions()
class Declaration {
    @Prop({ type: Boolean })
    is_pep: boolean;

    @Prop({ type: Boolean })
    is_tax_resident: boolean;
}

@SchemaOptions()
export class CorrespondanceAddress {
    @Prop({ type: String })
    line_1?: string;

    @Prop({ type: String })
    line_2: string;

    @Prop({ type: String })
    line_3: string;

    @Prop({ type: String })
    pin_code: string;

    @Prop({ type: String })
    city: string;

    @Prop({ type: String })
    state: string;

    @Prop({ type: String })
    country: string;

    @Prop({ type: String, enum: CompanyAddressType })
    address_type: CompanyAddressType;

    @Prop({ type: String })
    type: string;

    @Prop({ type: String })
    document: string;

    @Prop({ type: String })
    pan_document: string;

    @Prop({ type: String })
    photo: string;
}

@SchemaOptions()
class BankAccount {
    @Prop({ type: String, enum: BankAccountType })
    type: BankAccountType;

    @Prop({ type: String })
    number: string;

    @Prop({ type: String })
    ifsc_code: string;

    @Prop({ type: String })
    document: string;

    @Prop({ type: String })
    name: string;
}

@SchemaOptions()
class DematAccount {
    @Prop({ type: String })
    number: string;

    @Prop({ type: String })
    dp_id?: string;

    @Prop({ type: String })
    client_id?: string;

    @Prop({ type: String })
    broker?: string;

    @Prop({ type: String, enum: DematType })
    demat_type?: DematType;
}

@SchemaOptions()
class CustomerCompanyDetails {
    @Prop({ type: String })
    place: string;

    @Prop({ type: String })
    tin?: string;

    @Prop({ type: String })
    registration?: string;

    @Prop({ type: String })
    gst_registration?: string;

    @Prop({ type: String, enum: InstitutionType })
    institution_type: InstitutionType;

    @Prop({ type: String })
    institution?: string;

    @Prop({ type: String, enum: ProofOfIdentity })
    poi: ProofOfIdentity;

    @Prop({ type: String })
    commencement_date: string;

    @Prop({ type: String })
    telephone_number: string;

    @Prop({ type: String })
    fax?: string;

    @Prop({ type: String, enum: NatureOfBusiness })
    nature_of_business: NatureOfBusiness;

    @Prop({ type: String })
    present_year_networth: string;

    @Prop({ type: String })
    previous_year_networth: string;

    @Prop({ type: String })
    present_year_turnover: string;

    @Prop({ type: String })
    previous_year_turnover: string;
}

@SchemaOptions()
class CustomerRelatedParty {
    @Prop({ type: String, enum: RelatedPartyType })
    party_type: RelatedPartyType;

    @Prop({ type: String })
    other_party_type?: string;

    @Prop({ type: String })
    din_company?: string;

    @Prop({ type: String })
    din_llp: string;

    @Prop({ type: String })
    aadhaar_number?: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    pan_number: string;

    @Prop({ type: String, enum: Gender })
    gender: Gender;

    @Prop({ type: String })
    father_name: string;

    @Prop({ type: String, enum: ResidentialStatus })
    residential_status: ResidentialStatus;

    @Prop({ type: String })
    nationality: string;

    @Prop({ type: String })
    line_1: string;

    @Prop({ type: String })
    line_2?: string;

    @Prop({ type: String })
    line_3?: string;

    @Prop({ type: String })
    pin_code: string;

    @Prop({ type: String })
    city: string;

    @Prop({ type: String })
    state: string;

    @Prop({ type: String })
    phone_number: string;

    @Prop({ type: String })
    telephone_number?: string;

    @Prop({ type: String })
    fax?: string;

    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    is_pep: string;

    @Prop({ type: String })
    is_tax_resident: string;
}

@SchemaOptions()
class UltimateBeneficialOwner {
    @Prop({ type: String, enum: UltimateBeneficialOwnerType })
    type: UltimateBeneficialOwnerType;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    address: string;

    @Prop({ type: String })
    father_name: string;

    @Prop({ type: String })
    birth_date: string;

    @Prop({ type: String })
    birth_country: string;

    @Prop({ type: String })
    residence_country: string;

    @Prop({ type: String })
    pan_number: string;

    @Prop({ type: String })
    us_person: string;

    @Prop({ type: String })
    id_doc_type: string;

    @Prop({ type: String })
    id_doc: string;

    @Prop({ type: String, enum: BeneficialOwnerRelation })
    relation: BeneficialOwnerRelation;

    @Prop({ type: String })
    tin: string;

    @Prop({ type: String })
    nationality: string;

    @Prop({ type: String })
    ownership: string;
}

@SchemaOptions()
class FatcaDeclaration {
    @Prop({ type: String })
    is_org: 'true' | 'false' = 'false';

    @Prop({ type: String })
    exchange_name?: string;

    @Prop({ type: String })
    is_tax_resident: 'true' | 'false' = 'false';

    @Prop({ type: String })
    is_fin_institution: 'true' | 'false' = 'false';

    @Prop({ type: String })
    is_entity_not_indian: 'true' | 'false' = 'false';

    @Prop({ type: String })
    giin?: string;
}

@SchemaOptions()
class KeyMemberDetails {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    pan_number: string;

    @Prop({ type: String })
    designation: string;
}

@SchemaOptions()
class Documents {
    @Prop({ type: String, enum: AddressProofType })
    poa_type?: AddressProofType;

    @Prop({ type: String })
    poa_document?: string;

    @Prop({ type: String })
    pan_document?: string;

    @Prop({ type: String })
    photo?: string;

    @Prop({ type: String })
    signature?: string;

    @Prop({ type: String })
    cancelled_cheque?: string;
}

@SchemaOptions({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            return ret;
        },
    },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'customer_profiles',
})
class CustomerProfile {
    @Prop({ type: String, enum: CustomerProfileType })
    type: CustomerProfileType;

    @Prop({ type: Schema.Types.ObjectId, unique: true })
    customer_id: ObjectId;

    @Prop({ type: String, unique: true, required: true })
    pan_number: string;

    @Prop({ type: Boolean, required: true, default: false })
    all_details_filled: boolean;

    @Prop({ type: Boolean, required: true, default: false })
    customer_rejected: boolean;

    @Prop({ type: String })
    rejection_discrepency?: string;

    @Prop({ type: [] })
    aml_hits: any[];

    @Prop({ type: Boolean, required: true, default: false })
    review_required: boolean;

    @Prop({ type: String, required: true })
    transaction_id: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    phone_number: string;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String, enum: Gender })
    gender: Gender;

    @Prop({ type: String, enum: CitizenshipStatus })
    citizenship?: CitizenshipStatus;

    @Prop({
        type: String,
        enum: IncomeCategory,
        default: IncomeCategory['10_25_LAKH'],
    })
    income_range: IncomeCategory;

    @Prop({ type: String })
    birth_date: string;

    @Prop({ type: String })
    fathers_name: string;

    @Prop({ type: String, enum: MaritalStatus })
    marital_status: MaritalStatus;

    @Prop({ type: String })
    ckyc_number: string;

    @Prop({ type: String })
    residential_status: string;

    @Prop({ type: String })
    occupation: string;

    @Prop(
        raw({
            type: { type: String },
            number: { type: String },
            name: { type: String },
            ifsc_code: { type: String },
            verified: { type: Boolean },
            demat_account_number: { type: String },
        }),
    )
    bank_account: Record<string, any>;

    @Prop({
        type: [SchemaFactory.createForClass(Nominee)],
        _id: false,
    })
    nominees: Nominee[];

    @Prop({
        type: Schema.Types.ObjectId,
    })
    kyc_form_attachment_id: ObjectId;

    @Prop({ type: SchemaFactory.createForClass(Declaration), _id: false })
    declaration: Declaration;

    @Prop({ type: SchemaFactory.createForClass(CorrespondanceAddress), _id: false })
    correspondance_address: CorrespondanceAddress;

    @Prop({ type: SchemaFactory.createForClass(Documents), _id: false })
    documents?: Documents;

    @Prop({ type: SchemaFactory.createForClass(DematAccount), _id: false })
    demat_account: DematAccount;

    @Prop({ type: Boolean })
    _is_nominee: boolean;

    @Prop({ type: String, enum: UserProfileType })
    profileType: UserProfileType;

    @Prop({ type: SchemaFactory.createForClass(CustomerCompanyDetails), _id: false })
    company_details: CustomerCompanyDetails;

    @Prop({ type: [SchemaFactory.createForClass(CustomerRelatedParty)], _id: false })
    related_party_details: CustomerRelatedParty[];

    @Prop({ type: [SchemaFactory.createForClass(UltimateBeneficialOwner)], _id: false })
    ultimate_beneficial_owner: UltimateBeneficialOwner[];

    @Prop({ type: [SchemaFactory.createForClass(KeyMemberDetails)], _id: false })
    key_member_details: KeyMemberDetails[];

    @Prop({ type: SchemaFactory.createForClass(FatcaDeclaration), _id: false })
    fatca_declaration: FatcaDeclaration;

    @Prop({ type: String })
    relationship_manager_name?: string;

    @Prop({ type: String })
    relationship_manager_email?: string;

    @Prop({ type: String })
    date?: string;

    @Prop({ type: String })
    place?: string;

    @Prop({ type: Object })
    aadhaar_details?: any;

    @Prop({ type: Object })
    pan_details?: any;

    @Prop({ type: String, enum: KycMode })
    kyc_mode?: KycMode;

    @Prop({ type: String })
    signed_form_link: string;
}

type CustomerProfileDocument = HydratedDocument<CustomerProfile>;
const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);

export { CustomerProfile, CustomerProfileDocument, CustomerProfileSchema };
