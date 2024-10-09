import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, ObjectId } from 'mongoose';

@Schema()
export class AbstractDocument {
    // @Prop({ type: SchemaTypes.ObjectId })
    // id: ObjectId;
}
