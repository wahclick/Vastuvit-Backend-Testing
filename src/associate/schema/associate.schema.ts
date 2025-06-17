import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AssociateDocument = Associate & Document;

// Project assignment sub-schema - NEW ADDITION
@Schema({ _id: false })
export class ProjectAssignment {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  totalAmount: number;

  @Prop()
  remarks?: string;

  @Prop({ required: true })
  areaSqMtr: number; // area in square meters

  @Prop({ required: true })
  areaSqFt: number; // area in square feet

  @Prop({ required: true })
  rate: number; // rate per unit

  @Prop({ type: Date, default: Date.now })
  assignedAt: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ProjectAssignmentSchema = SchemaFactory.createForClass(ProjectAssignment);

@Schema({ timestamps: true })
export class Associate {
  @Prop({ type: Types.ObjectId, ref: 'Manager', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Firms', required: true })
  firm_id: Types.ObjectId;

  @Prop({ required: true })
  prefix: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({})
  fullName: string;

  @Prop({
    required: true,
    validate: {
      validator: function (v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Telephone must be 10 digits',
    },
  })
  telephone: string;

  @Prop({
    validate: {
      validator: function (v: string) {
        return !v || /^\d{10}$/.test(v);
      },
      message: 'Additional telephone must be 10 digits',
    },
  })
  additionalTelephone?: string;

  @Prop({
    required: true,
    lowercase: true,
    validate: {
      validator: function (v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format',
    },
  })
  email: string;

  @Prop({
    type: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      fullAddress: String,
    },
    required: true,
  })
  address: {
    street?: string;
    city: string;
    state: string;
    country: string;
    fullAddress?: string;
  };

  @Prop({
    type: {
      bankName: { type: String, required: true },
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true, uppercase: true },
    },
    required: true,
  })
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
  };

  @Prop({ required: true })
  type: string;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;

  // NEW ADDITION - Project assignments array
  @Prop({ type: [ProjectAssignmentSchema], default: [] })
  projectAssignments: ProjectAssignment[];
}

export const AssociateSchema = SchemaFactory.createForClass(Associate);

// Keep your existing pre-save middleware
AssociateSchema.pre('save', function (next) {
  if (this.prefix && this.firstName && this.lastName) {
    this.fullName = `${this.prefix} ${this.firstName} ${this.lastName}`;
  }
  if (
    this.address?.street &&
    this.address?.city &&
    this.address?.state &&
    this.address?.country
  ) {
    this.address.fullAddress = `${this.address.street}, ${this.address.city}, ${this.address.state}, ${this.address.country}`;
  }
  next();
});