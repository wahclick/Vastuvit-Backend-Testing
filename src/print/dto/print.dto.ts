import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PrintType {
  BW = 'B/W',
  COLOR = 'Color'
}

export enum PrintSize {
  A4 = 'A4',
  A3 = 'A3',
  A2 = 'A2',
  A1 = 'A1',
  A0 = 'A0'
}

@Schema({ timestamps: true })
export class Print extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project_id: Types.ObjectId;

  @Prop({ type: String, enum: PrintType, required: true })
  type: PrintType;

  @Prop({ type: String, enum: PrintSize, required: true })
  size: PrintSize;

  @Prop({ type: Number, required: true, min: 1 })
  number_of_prints: number;

  @Prop({ type: String })
  remarks: string;
}

export const PrintSchema = SchemaFactory.createForClass(Print);