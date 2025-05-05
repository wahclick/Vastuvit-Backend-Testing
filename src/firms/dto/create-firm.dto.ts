import { Types } from "mongoose";

export class CreateFirmDto {
    name: string;
    address: {
      buildingNumber: string;
      streetArea: string;
      landmark: string;
      city: string;
      state: string;
      country: string;
    };
    logo?: string;
    user_id: Types.ObjectId;
  }