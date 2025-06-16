// src/associate-payments/schemas/associate-payment.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Payment History Item - Only actual payments
@Schema({ _id: true })
export class PaymentHistoryItem {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  paymentDate: Date;

  @Prop({ required: true })
  paymentMode: string; // Cash, UPI, Bank Transfer, Cheque, etc.

  @Prop({ required: true })
  balance: number; // Remaining balance after this payment

  @Prop({ type: String })
  remarks?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export type AssociatePaymentDocument = AssociatePayment & Document;

@Schema({ timestamps: true })
export class AssociatePayment {
  @Prop({ type: Types.ObjectId, ref: 'Associate', required: true })
  associateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Manager', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  associateName: string;

  @Prop({ required: true })
  associateType: string; // Consultant, Contractor, Vendor, Supplier

  @Prop({ required: true })
  totalProjectAmount: number; // Total amount owed to associate for this project

  @Prop({ type: Number, default: 0 })
  totalPaidAmount: number; // Total amount paid so far

  @Prop({ required: true })
  areaSqMtr: number; // Area in square meters

  @Prop({ required: true })
  areaSqFt: number; // Area in square feet

  @Prop({ required: true })
  rate: number; // Rate per unit

  @Prop({ type: String })
  projectRemarks?: string; // Project-specific remarks

  @Prop({ type: [PaymentHistoryItem], default: [] })
  paymentHistory: PaymentHistoryItem[];

  @Prop({
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'ON_HOLD'],
    default: 'ACTIVE',
  })
  status: string;

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export const AssociatePaymentSchema = SchemaFactory.createForClass(AssociatePayment);