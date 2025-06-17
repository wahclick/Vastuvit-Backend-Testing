import {
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
  IsEmail,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

// Reusing the same DTOs from create-project.dto.ts
class MeasurementMetricDto {
  @IsNumber()
  @IsOptional()
  plotArea?: number;

  @IsNumber()
  @IsOptional()
  groundCoverage?: number;

  @IsNumber()
  @IsOptional()
  farArea?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  builtCovered?: number;

  @IsNumber()
  @IsOptional()
  builtPlinth?: number;

  @IsNumber()
  @IsOptional()
  superArea?: number;

  @IsNumber()
  @IsOptional()
  carpetArea?: number;
}

class WingDto {
  @IsString()
  @IsOptional()
  block?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  wings?: string[];
}

class ClusterDto {
  @IsString()
  @IsOptional()
  cluster?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  units?: string[];
}

class SiteVisitDto {
  @IsString()
  @IsOptional()
  visitBy?: string;

  @IsNumber()
  @IsOptional()
  perVisitCharge?: number;

  @IsDateString()
  @IsOptional()
  dateOfVisit?: Date;
}

class BillingStageDto {
  @IsDateString()
  @IsOptional()
  tentativeDate?: Date;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  projectStage?: string;

  @IsString()
  @IsOptional()
  projectRemark?: string;
}

class ProjectDetailsDto {
  @IsString()
  @IsOptional()
  drawingCategory?: string;

  @IsString()
  @IsOptional()
  drawingType?: string;
}

export class UpdateProjectDto {
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  firmId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  clientId?: Types.ObjectId;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  vastuCompliant?: boolean;

  @IsString()
  @IsOptional()
  projectCategory?: string;

  @IsString()
  @IsOptional()
  projectType?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsNumber()
  @IsOptional()
  totalBudget?: number;

  @IsNumber()
  @IsOptional()
  designFee?: number;

  @IsNumber()
  @IsOptional()
  advanceAmount?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => MeasurementMetricDto)
  @IsOptional()
  measurementMetric?: MeasurementMetricDto;

  @IsObject()
  @ValidateNested()
  @Type(() => MeasurementMetricDto)
  @IsOptional()
  measurementImperial?: MeasurementMetricDto;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WingDto)
  @IsOptional()
  blockWings?: WingDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClusterDto)
  @IsOptional()
  clusterUnits?: ClusterDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiteVisitDto)
  @IsOptional()
  siteVisits?: SiteVisitDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillingStageDto)
  @IsOptional()
  billingStages?: BillingStageDto[];

  @IsString()
  @IsOptional()
  projectCode?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ProjectDetailsDto)
  @IsOptional()
  details?: ProjectDetailsDto;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsOptional()
  @IsMongoId()
  referralId?: Types.ObjectId;

  // ========== NEW FIELDS ADDED ==========
  
  // Client Information Fields
  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  clientAddress?: string;

  @IsString()
  @IsOptional()
  clientCity?: string;

  @IsString()
  @IsOptional()
  clientState?: string;

  @IsString()
  @IsOptional()
  clientCountry?: string;

  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  // Contact Person Fields
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  contactPersonPhone?: string;

  // Project Value Field
  @IsNumber()
  @IsOptional()
  projectValue?: number;

  // Referral Fields
  @IsString()
  @IsOptional()
  referralBy?: string;

  @IsNumber()
  @IsOptional()
  referralAmount?: number;
}