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

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Designation',
  })
  designationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, unique: true })
  emp_id: string;

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

  // Adding leave balances
  @Prop({
    type: Object,
    default: {
      el: 0,
      cl: 0,
      sl: 0,
      shl: 0,
      ml: 0,
      pl: 0,
      mgl: 0,
      bl: 0,
      lop: 0,
      lwp: 0,
      ph: 0,
      co: 0,
      hl: 0,
      total: 0,
    },
  })
  leave_balances: {
    el: number;
    cl: number;
    sl: number;
    shl: number;
    ml: number;
    pl: number;
    mgl: number;
    bl: number;
    lop: number;
    lwp: number;
    ph: number;
    co: number;
    hl: number;
    total: number;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CrewSchema = SchemaFactory.createForClass(Crew);
