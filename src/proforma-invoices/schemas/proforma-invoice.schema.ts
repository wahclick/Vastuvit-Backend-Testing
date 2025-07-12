import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProformaInvoiceDocument = ProformaInvoice & Document;

@Schema()
export class ProformaItem {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  hsn: string;

  @Prop({ required: true })
  unit: number;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  amount: number;
}

@Schema({ timestamps: true })
export class ProformaInvoice {
  @Prop({ required: true })
  proformaNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  clientName: string;

  @Prop()
  clientGSTIN: string;

  @Prop()
  clientAddress: string;

  @Prop()
  clientCity: string;

  @Prop()
  clientState: string;

  @Prop()
  clientCountry: string;

  @Prop()
  pointOfContact: string;

  @Prop()
  pointOfContactAddress: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  projectName: string;

  @Prop({ type: Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ required: true })
  piDate: Date;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ type: [ProformaItem], required: true })
  items: ProformaItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  gstPercentage: number;

  @Prop({ default: 0 })
  gstAmount: number;

  @Prop()
  gstType: string;

  @Prop({ default: 0 })
  discountPercentage: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop()
  amountInWords: string;

  @Prop({ required: true })
  paymentMode: string;

  @Prop()
  notes: string;

  @Prop({ type: [String] })
  termsAndConditions: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  convertedToInvoice: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Invoice' })
  invoiceId: Types.ObjectId;
}

export const ProformaInvoiceSchema = SchemaFactory.createForClass(ProformaInvoice);
