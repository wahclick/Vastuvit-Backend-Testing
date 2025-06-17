import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { timeStamp } from 'console';
import { Document, Mongoose, Schema as MongooseSchema, Types } from 'mongoose';

export type RankDocument = Rank & Document;

@Schema({ timestamps: true })
export class Rank {
  [x: string]: any;
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ default: true })
  isEnabled: boolean;
}

export const RankSchema = SchemaFactory.createForClass(Rank)