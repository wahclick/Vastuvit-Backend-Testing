// src/accounting/schemas/accounting.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../enums/payment-status.enum';

export type AccountingDocument = Accounting & Document;

@Schema({ timestamps: true })
export class Accounting {
  @Prop({ type: Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: false })
  projectId?: Types.ObjectId;

  @Prop({ type: Date, required: true })
  tentativeDate: Date;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String })
  remark: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    required: true,
  })
  status: PaymentStatus;

  @Prop({ type: String })
  paymentType: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  modeOfPayment: string;

  @Prop({ type: String })
  accountNo: string;

  @Prop({ type: Date })
  dateOfPayment: Date;

  @Prop({ type: String })
  expenseType: string;
}

export const AccountingSchema = SchemaFactory.createForClass(Accounting);
