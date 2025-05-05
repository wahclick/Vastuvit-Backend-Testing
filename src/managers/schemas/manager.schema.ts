import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ManagerDocument = Manager & Document;

@Schema({ timestamps: true })
export class Manager {
  @Prop({ required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
  email: string;

  @Prop({ required: true, unique: true, match: /^[0-9]{10}$/ })
  mobile: string;

  @Prop({})
  name: string;

  @Prop({})
  password: string;

  @Prop({})
  address: string;

  @Prop()
  profileImage: string;

  // Array of firm IDs that this manager owns
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Firm' }] })
  ownedFirms: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  profileCompleted: boolean;

  @Prop({ default: 'TopManagement' })
  role: string;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);
