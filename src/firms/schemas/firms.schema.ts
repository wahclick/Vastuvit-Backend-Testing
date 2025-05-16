import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// Let's standardize on lowercase for consistency with your frontend code
export enum LeaveType {
  shl = 'Short Leave',
  hl = 'Half Day Leave',
  el = 'Earned Leave',
  cl = 'Casual Leave',
  lop = 'Leave Without Pay',
  lwp = 'Leave Without Pay', // Changed from LWP to lwp
  co = 'Compensatory Off',
  sl = 'Sick Leave',
  mgl = 'Marriage Leave',
  ml = 'Maternity Leave',
  pl = 'Paternity Leave',
  ph = 'Public Holiday',
  bl = 'Bereavement Leave',
}

export type FirmsDocument = Firms & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Firms {
  // Existing fields
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
    required: true,
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

  // Fixed the casing to be consistent - standardized on lowercase
  @Prop({
    type: Object,
    default: {
      shl: false,
      hl: false, // Changed from HL to hl
      el: false,
      cl: false,
      lop: false,
      lwp: false, // Added lwp
      co: false,
      sl: false,
      mgl: false,
      ml: false,
      pl: false,
      ph: false,
      bl: false,
    },
  })
  office_leave_settings: {
    shl?: boolean;
    hl?: boolean; // Changed from HL to hl
    el?: boolean;
    cl?: boolean;
    lop?: boolean;
    lwp?: boolean; // Added lwp
    co?: boolean;
    sl?: boolean;
    mgl?: boolean;
    ml?: boolean;
    pl?: boolean;
    ph?: boolean;
    bl?: boolean;
  };
}

export const FirmsSchema = SchemaFactory.createForClass(Firms);