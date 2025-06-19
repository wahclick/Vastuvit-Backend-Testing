// In your schema/leave.schema.ts file
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type LeaveDocument = Leave & Document;

// Update your LeaveType enum to include all the leave type codes you're using
export enum LeaveType {
  SHL = 'shl',
  HL = 'hl',
  CL = 'cl',
  EL = 'el',
  LOP = 'lop',
  LWP = 'lwp',
  CO = 'co',
  SL = 'sl',
  MGL = 'mgl',
  ML = 'ml',
  PL = 'pl',
  PH = 'ph',
  BL = 'bl',
}

@Schema({ timestamps: true })
export class Leave {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Firm' })
  firm_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Crew' })
  crew_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: LeaveType })
  leave_type: LeaveType;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ default: 'pending', enum: ['pending', 'approved', 'rejected'] })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Crew' })
  approved_by: MongooseSchema.Types.ObjectId;

  @Prop()
  approved_at: Date;

  @Prop()
  rejection_reason: string;

  @Prop({ required: true })
  days: number;

  @Prop()
  crew_name: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
