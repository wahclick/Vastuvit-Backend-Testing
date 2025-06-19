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
