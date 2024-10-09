import { HydratedDocument, ObjectId, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AccessControlList } from 'src/constants/access-control.const';

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
    collection: 'role_groups',
})
class RoleGroup {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: String, required: true })
    type: string;

    @Prop({ type: Boolean, default: true })
    is_editable: boolean;

    // @Prop({ type: String, default: RoleGroupCategory.MANAGER })
    // category: RoleGroupCategory;

    // enum includes UserRole + RoleGroupName
    @Prop({ type: [String] })
    roles: AccessControlList[];

    @Prop({
        type: SchemaTypes.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;
}

type RoleGroupDocument = HydratedDocument<RoleGroup>;
const RoleGroupSchema = SchemaFactory.createForClass(RoleGroup);

RoleGroupSchema.index({ type: 1, account_id: 1 }, { unique: true });

export { RoleGroup, RoleGroupDocument, RoleGroupSchema };
