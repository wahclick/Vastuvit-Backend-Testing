import { Types } from 'mongoose';

export class UpdateDesignationDto {
  label?: string;
  value?: string;
  firmId?: Types.ObjectId;
  rankId?: Types.ObjectId;
  isEnabled?: boolean;
}
