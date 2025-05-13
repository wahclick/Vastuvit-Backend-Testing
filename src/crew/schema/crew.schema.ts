import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CrewDocument = Crew & Document;

@Schema({ timestamps: true })
export class Crew {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Firms' })
  firmId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Manager' })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Rank', required: true })
  rankId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Designation',
    required: true,
  })
  designationId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  salary: number;

  @Prop({ type: Date, required: true })
  dateOfJoining: Date;

  @Prop({ type: Date })
  dateOfAnniversary: Date;

  @Prop({ type: String, required: true })
  telephone: string;

  @Prop({ type: String })
  additionalNumber: string;

  @Prop({ type: String })
  profileImage: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Boolean, default: true })
  isEnabled: boolean;
}

export const CrewSchema = SchemaFactory.createForClass(Crew);
