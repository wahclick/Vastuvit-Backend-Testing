// src/memos/schemas/memo.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MemoDocument = Memo & Document;

@Schema({ timestamps: true })
export class Memo {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Manager' })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Firm' })
  firmId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Project' })
  projectId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Crew' })
  assign_to: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Crew' })
  assigned_by: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  remark: string;
}

export const MemoSchema = SchemaFactory.createForClass(Memo);
