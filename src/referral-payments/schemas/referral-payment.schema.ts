// src/referral-payments/schemas/referral-payment.schema.ts
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
  paymentMode: string; // Cash, UPI, Bank Transfer, etc.

  @Prop({ required: true })
  balance: number; // Remaining balance after this payment

  @Prop({ type: String })
  remarks?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export type ReferralPaymentDocument = ReferralPayment & Document;

@Schema({ timestamps: true })
export class ReferralPayment {
  @Prop({ type: Types.ObjectId, ref: 'Referral', required: true })
  referralId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Manager', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true })
  referralName: string;

  @Prop({ required: true })
  totalReferralAmount: number; // Total amount owed to referral

  @Prop({ type: Number, default: 0 })
  totalPaidAmount: number; // Total amount paid so far

  @Prop({ required: true })
  referralPercentage: number;

  @Prop({ type: [PaymentHistoryItem], default: [] })
  paymentHistory: PaymentHistoryItem[];

  @Prop({
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'ACTIVE',
  })
  status: string;

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export const ReferralPaymentSchema =
  SchemaFactory.createForClass(ReferralPayment);
