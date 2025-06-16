// src/team/schemas/team.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Firm',
    required: true,
  })
  firmId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Manager',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ required: true })
  team_name: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Crew',
    required: true,
  })
  team_head: Types.ObjectId;

  @Prop([
    {
      type: MongooseSchema.Types.ObjectId,
      ref: 'Project',
    },
  ])
  assigned_projects: Types.ObjectId[];

  @Prop([
    {
      type: MongooseSchema.Types.ObjectId,
      ref: 'Crew',
    },
  ])
  assigned_members: Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
