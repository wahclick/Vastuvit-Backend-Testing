import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum PaymentMode {
  CASH = 'Cash',
  DEBIT_CREDIT_CARDS = 'Debit/Credit Cards',
  UPI = 'UPI',
  MOBILE_WALLETS = 'Mobile Wallets',
  NET_BANKING = 'Net Banking',
  IMPS = 'Immediate Payment Service (IMPS)',
  NEFT = 'National Electronic Funds Transfer (NEFT)',
  CHEQUE = 'Cheque',
}

@Schema({ _id: true })
export class ReceiptItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  sNo: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  amount: number;
}

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: false })
  clientGSTIN: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  projectName: string;

  @Prop({ required: true, unique: true })
  receiptNumber: string;

  @Prop({ required: true, type: Date })
  receiptDate: Date;

  @Prop({ required: true })
  clientAddress: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentMode),
    required: true,
  })
  modeOfPayment: PaymentMode;

  @Prop({ type: [ReceiptItem], required: true })
  items: ReceiptItem[];

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({ type: String })
  notes: string;

  @Prop({
    type: String,
    enum: ['DRAFT', 'RECEIVED', 'PROCESSED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
