import { HydratedDocument, ObjectId, Schema, SchemaTypes } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';
import { RecordAction, RecordCollection } from 'src/constants/user-log.const';

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
    collection: 'user_logs',
})
export class UserLog {
    // @Prop({
    //     type: String,
    //     required: true,
    // })
    // user_name: string;

    // @Prop({
    //     type: String,
    //     required: true,
    // })
    // user_email: string;

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    record_id: ObjectId;

    @Prop({
        type: String,
        required: true,
        index: true,
        // enum: RecordCollection,
    })
    record_collection: string;

    @Prop({
        type: String,
        required: true,
        index: true,
        // enum: RecordAction,
    })
    record_action: string;

    @Prop({ type: String })
    record_before: string;

    @Prop({ type: String })
    record_after: string;

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
}

type UserLogDocument = HydratedDocument<UserLog>;
const UserLogSchema = SchemaFactory.createForClass(UserLog);

export { UserLogDocument, UserLogSchema };
