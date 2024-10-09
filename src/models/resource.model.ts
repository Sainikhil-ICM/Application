import {
    ResourceCategory,
    ResourceStatus,
    ResourceSubCategory,
    ResourceType,
} from 'src/constants/resource.const';
import { HydratedDocument, ObjectId, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
    collection: 'resources',
})
class Resource {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({
        type: String,
        enum: ResourceStatus,
        default: ResourceStatus.ACTIVE,
    })
    status: ResourceStatus;

    @Prop({ type: String, required: true })
    category: ResourceCategory;

    @Prop({ type: String })
    sub_category: ResourceSubCategory;

    @Prop({ type: String, required: true })
    type: ResourceType;

    // Reference ID of the resource document
    // Required if resource type is DOCUMENT
    @Prop({ type: SchemaTypes.ObjectId })
    attachment_id?: ObjectId;

    // URL link of the resource document
    // Required if resource type is LINK
    @Prop({ type: String })
    link: string;

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

type ResourceDocument = HydratedDocument<Resource>;
const ResourceSchema = SchemaFactory.createForClass(Resource);

export { Resource, ResourceDocument, ResourceSchema };
