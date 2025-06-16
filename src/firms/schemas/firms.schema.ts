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

// Print size and type enums for better type safety
export enum PrintSize {
  A4 = 'A4',
  A3 = 'A3',
  A2 = 'A2',
  A1 = 'A1',
  A0 = 'A0',
}

export enum PrintType {
  BW = 'B/W',
  COLOR = 'Color',
}

// Interface for print pricing structure
export interface PrintPriceItem {
  printSize: PrintSize;
  printType: PrintType;
  cost: number;
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

  @Prop({ type: Object })
  office_timing: {
    hour: number;
    min: number;
    timingoffice: string;
    start: string;
    end: string;
    lunchStart?: string;
    lunchEnd?: string;
  };

  @Prop({ type: Object, default: { percentage: 0, enabled: false } })
  profit_settings: {
    percentage: number;
    enabled: boolean;
  };

  // NEW: Threshold settings
  @Prop({ type: Object, default: { percentage: 0, enabled: false } })
  threshold_settings: {
    percentage: number;
    enabled: boolean;
  };

  @Prop({ type: Object, default: { isEnabled: false, salaryper: 0 } })
  overtime_settings: {
    isEnabled: boolean;
    salaryper: number;
  };

  @Prop({
    type: Object,
    default: {
      pc: false, // Project Category
      pd: false, // Project Date
      pm: false, // Project Month
      py: false, // Project Year
      coin: false, // Company Initial
      clin: false, // Client Initial
    },
  })
  project_code_settings: {
    pc: boolean;
    pd: boolean;
    pm: boolean;
    py: boolean;
    coin: boolean;
    clin: boolean;
  };

  @Prop({ type: Object, default: {} })
  holiday_settings: {
    [year: number]: {
      statutory?: {
        selectedDays: string[];
        saturdayOptions: string[];
      };
      National?: { [id: string]: any };
      Assigned?: { [id: string]: any };
      Unplanned?: { [id: string]: any };
      specialWorkingDays?: { [id: string]: any };
      totalholiday?: number;
      totalworkingday?: number;
    };
  };

  // NEW: Print Price settings
  @Prop({
    type: [Object],
    default: [
      // Default pricing structure for all combinations
      { printSize: 'A4', printType: 'B/W', cost: 0 },
      { printSize: 'A4', printType: 'Color', cost: 0 },
      { printSize: 'A3', printType: 'B/W', cost: 0 },
      { printSize: 'A3', printType: 'Color', cost: 0 },
      { printSize: 'A2', printType: 'B/W', cost: 0 },
      { printSize: 'A2', printType: 'Color', cost: 0 },
      { printSize: 'A1', printType: 'B/W', cost: 0 },
      { printSize: 'A1', printType: 'Color', cost: 0 },
      { printSize: 'A0', printType: 'B/W', cost: 0 },
      { printSize: 'A0', printType: 'Color', cost: 0 },
    ],
  })
  printPrice: PrintPriceItem[];
}

export const FirmsSchema = SchemaFactory.createForClass(Firms);

// Constants for frontend use
export const typesize = [
  { label: 'A4', value: 'A4' },
  { label: 'A3', value: 'A3' },
  { label: 'A2', value: 'A2' },
  { label: 'A1', value: 'A1' },
  { label: 'A0', value: 'A0' },
];

export const typedata = [
  { label: 'B/W', value: 'B/W' },
  { label: 'Color', value: 'Color' },
];