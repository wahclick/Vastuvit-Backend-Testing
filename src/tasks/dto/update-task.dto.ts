// dto/update-task.dto.ts - UPDATED to include assignedBy
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  IsMongoId,
} from '@nestjs/class-validator';
import { Transform } from 'class-transformer';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsMongoId()
  firmId?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsString()
  assignerRemark?: string;

  @IsOptional()
  @IsString()
  timeTaken?: string;

  @IsOptional()
  @IsMongoId()
  assignTo?: string;

  // ADD THESE NEW FIELDS
  @IsOptional()
  @IsMongoId()
  assignedBy?: string; // Who actually assigned the task

  @IsOptional()
  @IsEnum(['Manager', 'Crew'])
  assignedByModel?: string; // Whether assignedBy is Manager or Crew

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  endDate?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  timeLimit?: string;

  @IsOptional()
  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsMongoId()
  taskCheckBy?: string;

  @IsOptional()
  @IsEnum(['approved', 'rejected', 'pending'])
  remarkStatus?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}
