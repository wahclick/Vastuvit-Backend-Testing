
// src/accounting/schemas/accounting.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ChequeStatus } from '../enums/cheque-status.enum';

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

  // NEW: Separate cheque status field
  @Prop({
    type: String,
    enum: Object.values(ChequeStatus),
    default: ChequeStatus.NOT_APPLICABLE,
  })
  chequeStatus: ChequeStatus;

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

  // NEW: Separate cheque clearance date
  @Prop({ type: Date })
  chequeClearanceDate: Date;

  @Prop({ type: String })
  expenseType: string;

  @Prop({ type: Types.ObjectId, required: false })
  personId?: Types.ObjectId;

  @Prop({ type: String })
  personName: string;
}

export const AccountingSchema = SchemaFactory.createForClass(Accounting);
