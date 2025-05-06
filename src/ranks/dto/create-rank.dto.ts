import { Types } from 'mongoose';

export class CreateRankDto {
  name: string;
  firmId: Types.ObjectId;
  isEnabled?: boolean = true;
}
