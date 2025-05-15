// create-project.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  IsObject,
  IsEnum,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { ProjectStatus } from '../../schemas/project-status.enum';

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
  @IsNotEmpty()
  block: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  wings?: string[];
}

class ClusterDto {
  @IsString()
  @IsNotEmpty()
  cluster: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  units?: string[];
}

class SiteVisitDto {
  @IsString()
  @IsNotEmpty()
  visitBy: string;

  @IsNumber()
  @IsNotEmpty()
  perVisitCharge: number;

  @IsDateString()
  @IsNotEmpty()
  dateOfVisit: Date;
}

class BillingStageDto {
  @IsDateString()
  @IsNotEmpty()
  tentativeDate: Date;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  projectStage: string;

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

export class CreateProjectDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  firmId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  clientId: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus = ProjectStatus.TO_START;

  @IsBoolean()
  @IsOptional()
  vastuCompliant?: boolean;

  @IsString()
  @IsNotEmpty()
  projectCategory: string;

  @IsString()
  @IsNotEmpty()
  projectType: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsNumber()
  @IsNotEmpty()
  totalBudget: number;

  @IsNumber()
  @IsNotEmpty()
  designFee: number;

  @IsNumber()
  @IsNotEmpty()
  advanceAmount: number;

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
  isEnabled?: boolean = true;
}
