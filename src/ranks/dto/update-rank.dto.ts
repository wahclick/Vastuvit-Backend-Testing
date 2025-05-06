import { Types } from 'mongoose';

export class UpdateRankDto {
  name?: string;
  firmId?: Types.ObjectId;
  isEnabled?: boolean;
}
