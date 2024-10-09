import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
    CustomerKycStatus,
    Gender,
    IncomeCategory,
    KycMode,
    ResidentialStatus,
} from 'src/constants/customer.const';

// export interface CustomerAttachment {
//     customer_id: string;
//     location: string;
//     link: string;
//     id: string;
//     type: string;
// }

@Schema()
class DigilockerRequestToken {
    @Prop({ type: String })
    doc_id: string;

    @Prop({ type: String })
    token: string;

    @Prop({ type: String })
    valid_till: string; // timestamp string representing until when the token is valid
}

export enum ConnectionType {
    ICM = 'ICM',
    BIDD = 'BIDD',
    MF = 'MF',
}

@Schema({ _id: false })
export class Connection {
    @Prop({ type: String, enum: ConnectionType })
    type: ConnectionType;

    @Prop({ type: String })
    access_token?: string; // replaces access_token of ICM

    @Prop({ type: Date })
    access_token_expires_at?: Date; // replaces access_token_expires_at of ICM

    @Prop({ type: String })
    refresh_token?: string; // replaces api_token of ICM

    /**
     * should be string or ObjectID
     */
    @Prop({ type: SchemaTypes.ObjectId })
    foreign_id?: string; // replaces foreign_id of ICM

    /**
     * should be string or ObjectID
     */
    @Prop({ type: String })
    kyc_id?: string; // replaces icmb_cust_id of ICM

    @Prop({
        type: String,
        default: CustomerKycStatus.BASIC_DETAILS_ENTERED,
        enum: CustomerKycStatus,
    })
    kyc_status?: string | CustomerKycStatus;
}

@Schema({
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.consent_secret;
            return ret;
        },
    },
    toObject: { virtuals: true },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'customers',
})
class Customer {
    @Prop({ type: String, required: true })
    name: string;

    // @Prop({
    //     type: String,
    //     default: CustomerKycStatus.BASIC_DETAILS_ENTERED,
    //     enum: CustomerKycStatus,
    // })
    // status: CustomerKycStatus;

    @Prop({ type: String, default: '91' })
    phone_code: string;

    @Prop({ type: String, required: true })
    phone_number: string;

    @Prop({ type: Boolean, default: false })
    is_phone_verified: boolean;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String })
    aof_digio_doc_id?: string;

    @Prop({
        type: SchemaFactory.createForClass(DigilockerRequestToken),
        _id: false,
    })
    digilocker_request_token?: DigilockerRequestToken;

    @Prop({ type: String, unique: true })
    pan_number: string;

    @Prop({ type: String, enum: Gender })
    gender: Gender;

    @Prop({
        type: String,
        enum: IncomeCategory,
        default: IncomeCategory.GT_25_LAKH,
    })
    income: IncomeCategory;

    @Prop({
        type: String,
        enum: ResidentialStatus,
        default: ResidentialStatus.RESIDENT_INDIVIDUAL,
    })
    residential_status: ResidentialStatus;

    // TODO - change to date type
    @Prop({ type: String })
    birth_date: string;

    @Prop({ type: String })
    demat_number: string;

    // Address
    @Prop({ type: String })
    address: string;

    @Prop({ type: String })
    locality: string;

    // @Prop({ type: String })
    // district: string;

    @Prop({ type: String })
    city: string;

    @Prop({ type: String })
    state: string;

    @Prop({ type: String })
    pincode: string;

    @Prop({ type: String })
    country: string;

    // Bank details
    @Prop({ type: String })
    upi_id: string;

    @Prop({ type: String })
    account_type: string;

    @Prop({ type: String })
    account_number: string;

    @Prop({ type: String })
    ifsc_code: string;

    @Prop({ type: Boolean, default: false })
    is_bank_verified: boolean;

    @Prop({ type: Boolean, default: false })
    is_penny_dropped: boolean;

    @Prop({ type: [String], default: [] })
    remarks: string[];

    // Segrated customers in the UI/UX.
    @Prop({ type: [String] })
    labels: string[];

    // Taging customers for backend reference.
    @Prop({ type: [String] })
    tags: string[];

    @Prop({ type: String, unique: true, sparse: true })
    access_token: string;

    // @Prop({ type: Date })
    // access_token_expires_at: Date;

    // @Prop({ type: Date, default: Date.now })
    // signed_at: Date;

    // JWT token for bonds api
    // @Prop({ type: String, required: true })
    // api_token: string;

    // secret for Otp
    @Prop({ type: String })
    consent_secret: string;

    // secret for mobile
    @Prop({ type: String })
    phone_secret: string;

    // expiry for mobile secret
    @Prop({ type: Date })
    phone_secret_expires_at: Date;

    // secret for email
    @Prop({ type: String })
    email_secret: string;

    // Consent Details
    @Prop({ type: Boolean, default: false })
    is_consent_given: boolean;

    // Consent Details
    @Prop({ type: Boolean, default: false })
    is_mandate_consent_given: boolean;

    @Prop({ type: Boolean, default: false })
    is_whatsapp_given: boolean;

    @Prop({ type: Boolean, default: false })
    is_mandate_approved: boolean;

    // @Prop({ type: String })
    // icmb_cust_id: string;

    @Prop({ type: String })
    mandate_id: string;

    @Prop({ type: String })
    client_code: string;

    @Prop({ type: [Connection], default: [], _id: false })
    connections: Connection[];

    // Customer ID from bonds platform
    // @Prop({
    //     type: SchemaTypes.ObjectId,
    //     required: true,
    //     unique: true,
    // })
    // foreign_id: ObjectId;

    @Prop({
        type: String,
        enum: KycMode,
    })
    kyc_mode?: KycMode;

    getConnectionValue: (connectionName: ConnectionType, fieldName: keyof Connection) => any;

    setConnectionValue: (
        connectionName: ConnectionType,
        fieldName: keyof Connection,
        value: any,
    ) => any;

    getConnection: (connectionType: ConnectionType) => Connection;
}

type CustomerDocument = HydratedDocument<Customer>;
const CustomerSchema = SchemaFactory.createForClass(Customer);

// CustomerSchema.plugin(require('mongoose-lean-virtuals'));

// CustomerSchema.virtual('account', {
//     ref: 'Account',
//     localField: 'account_id',
//     foreignField: '_id',
//     justOne: true,

CustomerSchema.virtual('advisor', {
    ref: 'UserCustomer',
    localField: '_id',
    foreignField: 'customer_id',
    // match: (customer) => ({ account_id: customer.account_id }),
    justOne: true,
});

// CustomerSchema.virtual('advisor', {
//     ref: 'User',
//     localField: 'advisor_id',
//     foreignField: '_id',
//     justOne: true,
// });

CustomerSchema.virtual('advisors', {
    ref: 'UserCustomer',
    localField: '_id',
    foreignField: 'customer_id',
});

CustomerSchema.methods.setConnectionValue = function (
    connectionName: ConnectionType,
    fieldName: keyof Connection,
    value: any,
) {
    if (!value) return;
    const connections = (this as CustomerDocument).connections || [];
    const relevantConnection = connections.find((connection) => connection.type === connectionName);

    if (!relevantConnection)
        this.connections = [
            ...connections,
            {
                type: connectionName,
                [fieldName]: value,
            },
        ];
    else relevantConnection[fieldName] = value;
};

CustomerSchema.methods.getConnectionValue = function (
    connectionName: ConnectionType,
    fieldName: keyof Connection,
) {
    return this.getConnection(connectionName)?.[fieldName];
};

CustomerSchema.statics.getCustomerByForeignId = async function (
    connectionType: ConnectionType,
    unique_id: string,
) {
    return this.findOne({
        connections: {
            $elemMatch: {
                type: connectionType,
                foreign_id: unique_id,
            },
        },
    });
};

CustomerSchema.methods.getConnection = function (connectionType: ConnectionType) {
    const connections = (this as CustomerDocument).connections || [];
    return connections.find((connection) => connection.type === connectionType);
};

CustomerSchema.statics.getCustomerByKycId = async function (
    connectionType: ConnectionType,
    unique_id: string,
) {
    return this.findOne({
        connections: {
            $elemMatch: {
                type: connectionType,
                kyc_id: unique_id,
            },
        },
    });
};

export interface CustomerStatics {
    getCustomerByForeignId: (
        connectionType: ConnectionType,
        unique_id: string | Types.ObjectId,
    ) => Promise<CustomerDocument>;
    getCustomerByKycId: (
        connectionType: ConnectionType,
        unique_id: string | Types.ObjectId,
    ) => Promise<CustomerDocument>;
}

export { Customer, CustomerDocument, CustomerSchema };
