// MODIFIED: tasks.schema.ts in NestJS backend to support metadata
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Firms', required: true })
  firmId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop()
  assignerRemark: string;

  @Prop()
  timeTaken: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Crew' })
  assignTo: Types.ObjectId;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  remarks: string;

  @Prop()
  timeLimit: string;

  @Prop({
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager' })
  taskCheckBy: Types.ObjectId;

  @Prop({ enum: ['approved', 'rejected', 'pending'], default: 'pending' })
  remarkStatus: string;

  @Prop()
  metadata: string; // JSON string for additional fields
}

export const TaskSchema = SchemaFactory.createForClass(Task);
