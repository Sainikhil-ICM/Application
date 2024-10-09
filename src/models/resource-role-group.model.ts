import { HydratedDocument, ObjectId, Schema } from 'mongoose';
import { Prop, Schema as SchemaOptions, SchemaFactory } from '@nestjs/mongoose';

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
    collection: 'resource_role_groups',
})
export class ResourceRoleGroup {
    @Prop({
        type: String,
        required: true,
        index: true,
    })
    role_group_type: string;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    resource_id: ObjectId;

    @Prop({
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
    })
    account_id: ObjectId;
}

type ResourceRoleGroupDocument = HydratedDocument<ResourceRoleGroup>;
const ResourceRoleGroupSchema = SchemaFactory.createForClass(ResourceRoleGroup);

export { ResourceRoleGroupDocument, ResourceRoleGroupSchema };
