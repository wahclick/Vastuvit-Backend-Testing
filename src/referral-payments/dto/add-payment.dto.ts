// src/referral-payments/dto/create-referral-payment.dto.ts
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

// src/referral-payments/dto/add-payment.dto.ts
export class AddPaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  paymentDate: string;

  @IsString()
  paymentMode: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

// src/referral-payments/dto/query-referral-payment.dto.ts
export class QueryReferralPaymentDto {
  @IsOptional()
  @IsMongoId()
  referralId?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsMongoId()
  firmId?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'COMPLETED', 'CANCELLED'])
  status?: string;
}
