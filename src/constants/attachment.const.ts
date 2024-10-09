export enum AttachmentType {
    PAN = 'PAN',
    AADHAR = 'AADHAR',
    PASSPORT = 'PASSPORT',
    DRIVING_LICENSE = 'DRIVING_LICENSE',
    VOTER_ID = 'VOTER_ID',
    BANK_STATEMENT = 'BANK_STATEMENT',
    CANCELLED_CHEQUE = 'CANCELLED_CHEQUE',
    OTHER = 'OTHER',
    INDIVIDUAL_PHOTO = 'INDIVIDUAL_PHOTO',
    ARN_EUIN_DOCUMENT = 'ARN_EUIN_DOCUMENT',
    PMS_NISM_21A_DOCUMENT = 'PMS_NISM_21A_DOCUMENT',
    GST_DOCUMENT = 'GST_DOCUMENT',
    INCORPORATION = 'INCORPORATION',
    BANK_DOCUMENT = 'BANK_DOCUMENT',
    DIRECTOR_PHOTO = 'DIRECTOR_PHOTO',
    SIGNATORY_PHOTO = 'SIGNATORY_PHOTO',
    ADDRESS_PROOF = 'ADDRESS_PROOF',
    ADDRESS = 'ADDRESS',
    KARTA_PHOTO = 'KARTA_PHOTO',
    COPARCENER_PHOTO = 'COPARCENER_PHOTO',
}

export const B2CAttachmentTypeMap = {
    address_attachment: 'address',
    pan_attachment: 'pan',
    cancelled_cheque_attachment: 'bank',
};

export const AttachmentTypeMap = {
    address_attachment: 'ADDRESS',
    pan_attachment: 'PAN',
    cancelled_cheque_attachment: 'CANCELLED_CHEQUE',
};

export type FileType = {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: string;
    fieldname: string;
};
