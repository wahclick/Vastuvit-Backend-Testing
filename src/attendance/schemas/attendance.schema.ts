// src/attendance/schemas/attendance.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// Type for a single attendance record
export interface AttendanceRecord {
  date: string; // Format: 'DD-MM-YYYY'
  status: 'present' | 'absent' | 'late' | 'leave' | 'holiday';
  loggedIn: string; // Format: 'HH:mm:ss'
  loggedOut: string; // Format: 'HH:mm:ss'
}

// Type for monthly records
export interface MonthlyRecords {
  [key: string]: AttendanceRecord[]; // Key is 'MM' (01-12)
}

// Type for yearly records
export interface AttendanceHistory {
  [key: string]: MonthlyRecords; // Key is 'YYYY'
}

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Firm',
    required: true,
  })
  firm_id: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Crew',
    required: true,
  })
  crew_id: Types.ObjectId;

  @Prop({
    type: Object,
    default: {},
  })
  history: AttendanceHistory;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Create a compound index on firm_id and crew_id to ensure uniqueness
AttendanceSchema.index({ firm_id: 1, crew_id: 1 }, { unique: true });
