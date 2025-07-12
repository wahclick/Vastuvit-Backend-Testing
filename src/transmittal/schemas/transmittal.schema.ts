
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TransmittalDocument = Transmittal & Document;

@Schema({ timestamps: true })
export class Transmittal {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: String, required: true })
  transno: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, required: true })
  preparedby: string;

  @Prop({ type: String, required: true })
  project: string;

  @Prop({ type: String, required: true })
  client: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ 
    type: String, 
    enum: ['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending' 
  })
  status: string;

  @Prop({ type: [Object], required: true })
  drawings: {
    drawno: string;
    drawtitle: string;
    designdisc: string;
    designpur: string;
    size: string;
    scale: string;
    copy: string;
  }[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const TransmittalSchema = SchemaFactory.createForClass(Transmittal);