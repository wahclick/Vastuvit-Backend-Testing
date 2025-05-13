import { Types } from 'mongoose';

export class CreateDesignationDto {
  label: string;
  value: string;
  firmId: Types.ObjectId;
  rankId: Types.ObjectId;
  isEnabled?: boolean = true;
}
