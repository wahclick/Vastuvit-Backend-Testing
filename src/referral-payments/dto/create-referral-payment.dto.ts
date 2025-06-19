import {
  IsString,
  IsNumber,
  IsMongoId,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  Max,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class CreateReferralPaymentDto {
  @IsMongoId()
  referralId: Types.ObjectId;

  @IsMongoId()
  projectId: Types.ObjectId;

  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  firmId: Types.ObjectId;

  @IsString()
  projectName: string;

  @IsString()
  referralName: string;

  @IsNumber()
  @Min(0)
  totalReferralAmount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  referralPercentage: number;
}
