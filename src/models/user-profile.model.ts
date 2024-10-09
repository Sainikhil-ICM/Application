import { HydratedDocument, ObjectId, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import {
    AumCategory,
    ClientBase,
    GrossAnnualIncome,
    RelationType,
    ProductType,
    UserProfileStatus,
    UserProfileType,
    UtmMedium,
    Gender,
} from 'src/constants/user-profile.const';

@Schema()
class Nominee {
    @Prop({ type: String })
    name: string;

    @Prop({ type: Date })
    birth_date: Date;

    @Prop({ type: Number })
    allocation: number;

    @Prop({ type: String, enum: RelationType })
    relation: RelationType;

    @Prop({ type: String })
    _nominee_address: string;

    @Prop(
        raw({
            name: { type: String },
            pan_number: { type: String },
            relation: { type: String },
        }),
    )
    guardian: Record<string, any>;

    @Prop(
        raw({
            house_number: { type: String },
            street: { type: String },
            pin_code: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
        }),
    )
    address: Record<string, any>;
}

@Schema()
class Contact {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    phone_number: string;

    @Prop({ type: String })
    can_send_comms: string;
}

@Schema()
class Signatory {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    pan_number: string;

    @Prop({ type: String })
    din_number: string;

    @Prop({ type: String })
    aadhaar_number: string;

    @Prop({ type: String }) // Assuming photo URL or file path is stored
    photo: string;

    @Prop({ type: String })
    pep: string;
}
@Schema()
class KartaOrCoparcener {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    pan_number: string;

    @Prop({ type: String })
    aadhaar_number: string;

    @Prop({ type: String }) // Assuming photo URL or file path is stored
    photo: string;

    @Prop({ type: String })
    pep: string;
}

@Schema({
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
    collection: 'user_profiles',
})
class UserProfile {
    @Prop({ type: Date })
    birth_date: Date;

    @Prop({ type: String })
    photo: string;

    @Prop({ type: String })
    signature: string;

    // @Prop({ type: String, match: /^\d{6}$/ })
    // pin_code: string;

    @Prop({ type: String })
    occupation: string;

    @Prop({ type: String })
    other_occupation: string;

    @Prop({ type: String, enum: Gender })
    gender: Gender;

    // @Prop({ type: String })
    // city: string;

    // @Prop({ type: String })
    // house_number: string;

    // @Prop({ type: String })
    // street: string;

    // @Prop({ type: String })
    // state: string;

    // @Prop({ type: String, default: 'IN' })
    // country: string;

    @Prop({ type: String, enum: UserProfileStatus })
    status: UserProfileStatus;

    @Prop({ type: String })
    remarks: string;

    @Prop({ type: String })
    _arn_holder: string;

    @Prop({ type: String })
    _pms_certfied: string;

    @Prop({ type: String })
    _gst_registered: string;

    @Prop({ type: String })
    _registered_address: string;

    @Prop({ type: String })
    _is_nominee: string;

    @Prop({ type: String })
    _is_employee_relative: string;

    @Prop({ type: String, enum: AumCategory })
    aum_category: AumCategory;

    @Prop({ type: String, enum: UtmMedium })
    utm_medium: UtmMedium;

    @Prop({ type: [String], enum: ClientBase })
    client_base: ClientBase[];

    @Prop({ type: [String], enum: ProductType })
    product_types: ProductType[];

    @Prop(
        raw({
            arn_number: { type: String },
            euin_number: { type: String },
            euin_validity: { type: Date },
            euin_document: { type: String },
        }),
    )
    arn: Record<string, any>;

    @Prop(
        raw({
            nism_21a_number: { type: String },
            nism_21a_validity: { type: Date },
            nism_21a_document: { type: String },
        }),
    )
    pms: Record<string, any>;

    @Prop(
        raw({
            type: { type: String },
            number: { type: String },
            ifsc_code: { type: String },
            branch: { type: String },
            bank_name: { type: String },
            document: { type: String },
        }),
    )
    bank_account: Record<string, any>;

    @Prop(
        raw({
            number: { type: String },
            state: { type: String },
            document: { type: String },
        }),
    )
    gst: Record<string, any>;

    @Prop(
        raw({
            name: { type: String },
            relation: { type: String },
        }),
    )
    employee_relative: Record<string, any>;

    @Prop({
        type: [SchemaFactory.createForClass(Nominee)],
        _id: false,
    })
    nominees: Nominee[];

    @Prop(
        raw({
            date: { type: Date },
            document: { type: String },
            place: { type: String },
        }),
    )
    incorporation: Record<string, any>;

    @Prop(
        raw({
            date: { type: Date },
            place: { type: String },
        }),
    )
    registration: Record<string, any>;

    @Prop({ type: String, enum: UserProfileType })
    type: UserProfileType;

    @Prop({ type: Date })
    cob_date: Date; // commencement of business

    @Prop({ type: String })
    board_resolution: string;

    @Prop({ type: String })
    memorandum_of_association: string;

    @Prop({ type: String })
    article_of_association: string;

    @Prop({ type: String })
    firm_deed: string;

    @Prop({ type: String })
    firm_resolution: string;

    @Prop({ type: String })
    trust_deed: string;

    @Prop({ type: String })
    karta_identity_proof: string;

    @Prop({ type: String })
    karta_address_proof: string;

    @Prop({ type: String, enum: GrossAnnualIncome })
    gross_annual_income: GrossAnnualIncome;

    @Prop({ type: String })
    net_worth: string;

    @Prop({ type: Date })
    net_worth_date: Date;

    @Prop({
        type: [SchemaFactory.createForClass(Contact)],
        _id: false,
    })
    contacts: Contact[];

    @Prop(
        raw({
            house_number: { type: String },
            street: { type: String },
            pin_code: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String, default: 'IN' },
            type: { type: String },
            document: { type: String },
        }),
    )
    correspondence_address: Record<string, any>;

    @Prop(
        raw({
            house_number: { type: String },
            street: { type: String },
            pin_code: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
            type: { type: String },
            document: { type: String },
        }),
    )
    registered_address: Record<string, any>;

    @Prop({
        type: [SchemaFactory.createForClass(Signatory)],
        _id: false,
    })
    directors: Signatory[];

    @Prop({
        type: [SchemaFactory.createForClass(Signatory)],
        _id: false,
    })
    signatories: Signatory[];

    @Prop({
        type: SchemaFactory.createForClass(KartaOrCoparcener),
        _id: false,
    })
    karta: KartaOrCoparcener;

    @Prop({
        type: [SchemaFactory.createForClass(KartaOrCoparcener)],
        _id: false,
    })
    coparceners: KartaOrCoparcener[];

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    user_id: ObjectId;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;

    @Prop({ type: Boolean, default: false })
    is_consent_given: boolean;
}

type UserProfileDocument = HydratedDocument<UserProfile>;
const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

export { UserProfile, UserProfileDocument, UserProfileSchema };
