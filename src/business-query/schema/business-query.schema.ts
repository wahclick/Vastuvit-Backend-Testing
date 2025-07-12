import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { BusinessQueryStatus } from '../enum/business-query-status.enum';

@Schema({ _id: true })
export class QueryHistory {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() }) // Auto-generate ObjectId
  _id: Types.ObjectId;

  @Prop({ type: Date, required: true })
  followUpDate: Date;

  @Prop({ type: Date, required: true })
  nextFollowUpDate: Date;

  @Prop({ type: String, required: false })
  remarks: string;

  @Prop({ type: String, required: false })
  assignedBy: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

// Measurement schema as a nested document
class MeasurementMetric {
  @Prop({ type: Number })
  plotArea: number;

  @Prop({ type: Number })
  groundCoverage: number;

  @Prop({ type: Number })
  farArea: number;

  @Prop({ type: Number })
  height: number;

  @Prop({ type: Number })
  builtCovered: number;

  @Prop({ type: Number })
  builtPlinth: number;

  @Prop({ type: Number })
  superArea: number;

  @Prop({ type: Number })
  carpetArea: number;
}

export type BusinessQueryDocument = BusinessQuery & Document;

@Schema({ timestamps: true })
export class BusinessQuery {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    enum: Object.values(BusinessQueryStatus),
    default: BusinessQueryStatus.OPEN,
  })
  status: BusinessQueryStatus;

  @Prop({ type: String, required: true })
  projectCategory: string;

  @Prop({ type: String, required: true })
  projectType: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  country: string;

  @Prop({ type: String })
  zipCode: string;

  @Prop({ type: Number, required: true })
  totalBudget: number;

  @Prop({ type: Number, required: true })
  designFee: number;

  @Prop({ type: Number, required: true })
  advanceAmount: number;

  @Prop({ type: Object })
  measurementMetric: MeasurementMetric;

  @Prop({ type: Object })
  measurementImperial: MeasurementMetric;

  @Prop({ type: Date })
  startDate: Date;

  @Prop({ type: Date })
  endDate: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Referral',
    required: false,
  })
  referralId: Types.ObjectId;

  @Prop({ type: String, required: false })
  referralName: string;

  @Prop({ type: Number, required: false, min: 0 })
  referralAmount: number;

  @Prop({ type: Number, required: false, min: 0, max: 100 })
  referralPercentage: number;

  @Prop({ type: [QueryHistory], default: [] })
  queryHistory: QueryHistory[];

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export const BusinessQuerySchema = SchemaFactory.createForClass(BusinessQuery);