// designation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type DesignationDocument = Designation & Document;

@Schema({ timestamps: true })
export class Designation {
  @Prop({ required: true, type: String })
  label: string;

  @Prop({ required: true, type: String })
  value: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Rank', required: true })
  rankId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firm', required: true })
  firmId: Types.ObjectId;

  @Prop({ default: true, type: Boolean })
  isEnabled: boolean;
}

export const DesignationSchema = SchemaFactory.createForClass(Designation);
