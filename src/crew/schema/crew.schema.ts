// schema/crew.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CrewDocument = Crew & Document;

@Schema({ timestamps: true })
export class Crew {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Firm' })
  firmId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Rank' })
  rankId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Designation' })
  designationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  // Add emp_id field
  @Prop({ required: true, unique: true })
  emp_id: string;

  // Add password field
  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  salary: number;

  @Prop({ required: true })
  dateOfJoining: Date;

  @Prop()
  dateOfAnniversary: Date;

  @Prop({ required: true })
  telephone: string;

  @Prop()
  additionalNumber: string;

  @Prop()
  profileImage: string;

  @Prop({ default: true })
  isEnabled: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CrewSchema = SchemaFactory.createForClass(Crew);