// project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ProjectStatus } from './project-status.enum';

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

// Wing schema
class Wing {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String })
  block: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, auto: true, _id: String }],
  })
  wings: { _id: Types.ObjectId; name: string }[];
}

// Cluster schema with _id
class Cluster {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: String })
  cluster: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, auto: true, _id: String }],
  })
  units: { _id: Types.ObjectId; name: string }[];
}

// Site Visit schema
class SiteVisit {
  @Prop({ type: String })
  visitBy: string;

  @Prop({ type: Number })
  perVisitCharge: number;

  @Prop({ type: Date })
  dateOfVisit: Date;
}

// Billing Stage schema
class BillingStage {
  @Prop({ type: Date })
  tentativeDate: Date;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: String })
  projectStage: string;

  @Prop({ type: String })
  projectRemark: string;
}
class PropertyItem {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false, default: null })
  value: any;
}

@Schema({ _id: true })
export class ProjectDetails {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isGlobal: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  blockId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  wingId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  clusterId?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  unitId?: mongoose.Types.ObjectId;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: [Object], default: [] })
  properties: PropertyItem[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
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
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.TO_START,
  })
  status: ProjectStatus;

  @Prop({ type: Boolean, default: false })
  vastuCompliant: boolean;

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

  @Prop({ type: [Object] })
  blockWings: Wing[];

  @Prop({ type: [Object] })
  clusterUnits: Cluster[];

  @Prop({ type: [Object] })
  siteVisits: SiteVisit[];

  @Prop({ type: [Object] })
  billingStages: BillingStage[];

  @Prop({ type: String, unique: true })
  projectCode: string;

  @Prop({ type: [ProjectDetails], default: [] })
  projectDetails: ProjectDetails[];

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
