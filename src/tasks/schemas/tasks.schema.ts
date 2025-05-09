// task.schema.ts
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

  @Prop({ type: String })
  assignerRemark: string;

  @Prop({ type: String })
  timeTaken: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Crew' })
  assignTo: Types.ObjectId;

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: String })
  remarks: string;

  @Prop({ type: String })
  timeLimit: string; // Format as HH:mm

  @Prop({
    type: String,

    default: 'pending',
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Manager' })
  taskCheckBy: Types.ObjectId;

  @Prop({
    type: String,

    default: 'pending',
  })
  remarkStatus: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
