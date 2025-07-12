import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum GSTType {
  SGST_CGST = 'SGST-CGST',
  UTGST = 'UTGST',
  IGST = 'IGST',
}

export enum PaymentMode {
  CASH = 'Cash',
  CHEQUE = 'Cheque',
  BANK_TRANSFER = 'Bank Transfer',
  UPI = 'UPI',
  CREDIT_CARD = 'Credit Card',
  DEBIT_CARD = 'Debit Card',
}

@Schema({ _id: true })
export class InvoiceItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  sNo: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  hsn: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, type: Number })
  rate: number;

  @Prop({ required: true, type: Number })
  quantity: number;

  @Prop({ required: true, type: Number })
  amount: number;
}

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
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
  invoiceNumber: string;

  @Prop({ required: true, type: Date })
  billDate: Date;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  @Prop({ required: true })
  clientAddress: string;

  @Prop({ required: true })
  siteAddress: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentMode),
    required: true,
  })
  modeOfPayment: PaymentMode;

  @Prop({ type: [InvoiceItem], required: true })
  items: InvoiceItem[];

  @Prop({
    type: String,
    enum: Object.values(GSTType),
    required: true,
  })
  gstType: GSTType;

  @Prop({ required: true, type: Number, min: 0, max: 100 })
  gstPercentage: number;

  @Prop({ required: true, type: Number })
  gstAmount: number;

  @Prop({ type: Boolean, default: false })
  gstSubmitted: boolean;

  @Prop({ type: Date })
  gstSubmissionDate: Date;

  @Prop({ type: Number, default: 0 })
  gstRefundAmount: number;

  @Prop({ type: Date })
  gstRefundDate: Date;

  // TDS Tracking Fields
  @Prop({ type: Number, default: 0 })
  tdsAmount: number;

  @Prop({ type: Boolean, default: false })
  tdsReceived: boolean;

  @Prop({ type: Date })
  tdsReceivedDate: Date;

  @Prop({ type: Date })
  tdsCertificateDate: Date;

  @Prop({ type: Boolean, default: false })
  includeDiscount: boolean;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  discountPercentage: number;

  @Prop({ type: Number, default: 0 })
  discountAmount: number;

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: String })
  termsAndConditions: string;

  @Prop({
    type: String,
    enum: ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
