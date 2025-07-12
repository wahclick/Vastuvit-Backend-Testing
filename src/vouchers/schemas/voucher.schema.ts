import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';



@Schema({ _id: true })
export class VoucherItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  sNo: number;

  @Prop({ required: true, trim: true, minlength: 1 })
  description: string;

  @Prop({ required: true, type: Number, min: 0 })
  amount: number;
}

export type VoucherDocument = Voucher & Document;

@Schema({ timestamps: true })
export class Voucher {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  voucherNumber: string;

  @Prop({ required: true, type: Date })
  voucherDate: Date;

  @Prop({ required: true })
  debitAccount: string;

  @Prop({ required: true })
  payTo: string;

  @Prop({ type: [VoucherItem], required: true })
  items: VoucherItem[];

  @Prop({ required: true, type: Number })
  totalAmount: number;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);
