import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ManagerDocument = Manager & Document;

@Schema({ timestamps: true })
export class Manager {
  @Prop({ required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
  email: string;

  @Prop({ required: true, unique: true, match: /^[0-9]{10}$/ })
  mobile: string;

  @Prop({})
  name: string;

  @Prop({})
  password: string;

  @Prop({})
  address: string;

  @Prop()
  profileImage: string;

  // ADD THESE NEW FIELDS FOR SALARY MANAGEMENT
  @Prop({ type: Number, default: 0 })
  salary: number;

  @Prop({ unique: true })
  emp_id: string;

  @Prop()
  telephone: string;

  @Prop()
  additionalNumber: string;

  @Prop({ type: Date })
  dateOfJoining: Date;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: Date })
  dateOfAnniversary: Date;

  // Salary history array - simplified for managers (no role changes)
  @Prop({
    type: [{
      amount: { type: Number, required: true },
      date: { type: String, required: true },
      changeType: { type: String, enum: ['increment', 'initial'], default: 'increment' },
      previous: { type: String, default: '0' }
    }],
    default: []
  })
  salaryHistory: Array<{
    amount: number;
    date: string;
    changeType: 'increment' | 'initial';
    previous: string;
  }>;

  @Prop({ type: Number, default: 0 })
  historyLength: number;

  // Leave balances
  @Prop({
    type: {
      el: { type: Number, default: 0 }, // Earned Leave
      cl: { type: Number, default: 0 }, // Casual Leave
      sl: { type: Number, default: 0 }, // Sick Leave
      shl: { type: Number, default: 0 }, // Special Holiday Leave
      ml: { type: Number, default: 0 }, // Maternity Leave
      pl: { type: Number, default: 0 }, // Paternity Leave
      mgl: { type: Number, default: 0 }, // Marriage Leave
      bl: { type: Number, default: 0 }, // Bereavement Leave
      lop: { type: Number, default: 0 }, // Loss of Pay
      ph: { type: Number, default: 0 }, // Public Holiday
      co: { type: Number, default: 0 }  // Comp Off
    },
    default: {}
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
    ph: number;
    co: number;
  };

  // Array of firm IDs that this manager owns
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Firms' }] })
  ownedFirms: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  profileCompleted: boolean;

  @Prop({ default: 'TopManagement' })
  role: string;
}

export const ManagerSchema = SchemaFactory.createForClass(Manager);