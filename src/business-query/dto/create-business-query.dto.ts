import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsObject,
  ValidateNested,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';
import { BusinessQueryStatus } from '../enum/business-query-status.enum';



class MeasurementMetricDto {
  @IsOptional()
  @IsNumber()
  plotArea?: number;

  @IsOptional()
  @IsNumber()
  groundCoverage?: number;

  @IsOptional()
  @IsNumber()
  farArea?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  builtCovered?: number;

  @IsOptional()
  @IsNumber()
  builtPlinth?: number;

  @IsOptional()
  @IsNumber()
  superArea?: number;

  @IsOptional()
  @IsNumber()
  carpetArea?: number;
}

export class CreateBusinessQueryDto {
  @IsString()
  userId: string;

  @IsString()
  firmId: string;

  @IsString()
  clientId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(BusinessQueryStatus)
  status?: BusinessQueryStatus;

  @IsString()
  projectCategory: string;

  @IsString()
  projectType: string;

  @IsString()
  address: string;

  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsNumber()
  totalBudget: number;

  @IsNumber()
  designFee: number;

  @IsNumber()
  advanceAmount: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MeasurementMetricDto)
  measurementMetric?: MeasurementMetricDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => MeasurementMetricDto)
  measurementImperial?: MeasurementMetricDto;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  referralId?: string;

  @IsOptional()
  @IsString()
  referralName?: string;

  @IsOptional()
  @IsNumber()
  referralAmount?: number;

  @IsOptional()
  @IsNumber()
  referralPercentage?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
