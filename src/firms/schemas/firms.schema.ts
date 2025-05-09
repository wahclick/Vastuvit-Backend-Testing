import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type FirmsDocument = Firms & Document & { _id: Types.ObjectId };
@Schema({ timestamps: true })
export class Firms {
  @Prop({ required: true, maxlength: 20 })
  name: string;

  @Prop({ required: true, type: Object })
  address: {
    buildingNumber: string;
    streetArea: string;
    landmark: string;
    city: string;
    country: string;
  };

  @Prop()
  logo: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Manager',
    required: true,  // Ensure user_id is required
  })
  user_id: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'free' })
  plan: string;

  @Prop()
  subscriptionStartDate: Date;

  @Prop()
  subscriptionEndDate: Date;
}


export const FirmsSchema = SchemaFactory.createForClass(Firms);
