// client.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Project' }] })
  projectIds: Types.ObjectId[];

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true })
  country: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  mobileNumber: string;

  @Prop({ type: String })
  additionalNumber: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: Date })
  dateOfAnniversary: Date;

  @Prop({ type: String })
  pointOfContact: string;

  @Prop({ type: String })
  pointOfContactAddress: string;

  @Prop({ type: String })
  pointOfContactMobileNumber: string;

  @Prop({ type: String })
  specificClientRequest: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firm', required: true })
  firmId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
