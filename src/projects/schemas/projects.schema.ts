// project.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
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
  @Prop({ type: String })
  block: string;

  @Prop({ type: [String] })
  wings: string[];
}

// Cluster schema
class Cluster {
  @Prop({ type: String })
  cluster: string;

  @Prop({ type: [String] })
  units: string[];
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

// Project Details schema
class ProjectDetails {
  @Prop({ type: String })
  drawingCategory: string;

  @Prop({ type: String })
  drawingType: string;
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

  @Prop({ type: Object })
  details: ProjectDetails;

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
