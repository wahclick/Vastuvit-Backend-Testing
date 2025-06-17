import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document;

@Schema({ timestamps: true })
export class Referral {
  @Prop({ type: Types.ObjectId, ref: 'Manager', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Firms', required: true })
  firm_id: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }] })
  project_id: Types.ObjectId[];

  @Prop({ required: true })
  prefix: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true })
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

  @Prop({ type: Number, default: 0, min: 0 })
  referralAmount: number;

  @Prop({ required: true, min: 0, max: 100 })
  referralPercentage: number;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Number, default: 0 })
  totalEarnings: number;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);


  