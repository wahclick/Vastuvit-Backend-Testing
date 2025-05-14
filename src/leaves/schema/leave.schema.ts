// src/leave/schemas/leave.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum LeaveType {
  SHL = 'ShL', // Short Leave
  HL = 'HL', // Half Day Leave
  EL = 'EL', // Earned Leave
  CL = 'CL', // Casual Leave
  LOP = 'LOP', // Leave Without Pay
  LWP = 'LWP', // Leave Without Pay (alternative name)
  CO = 'CO', // Compensatory Off
  SL = 'SL', // Sick Leave
  MgL = 'MgL', // Marriage Leave
  ML = 'ML', // Maternity Leave
  PL = 'PL', // Paternity Leave
  PH = 'PH', // Public Holiday
  BL = 'BL', // Bereavement Leave
}

export type LeaveDocument = Leave & Document;

@Schema({ timestamps: true })
export class Leave {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Firm' })
  firm_id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Crew' })
  crew_id: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(LeaveType),
  })
  leave_type: LeaveType;

  @Prop({ type: Date, required: true })
  start_date: Date;

  @Prop({ type: Date, required: true })
  end_date: Date;

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager' })
  approved_by: Types.ObjectId;

  @Prop({ type: Date })
  approved_at: Date;

  @Prop({ type: String })
  rejection_reason: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
