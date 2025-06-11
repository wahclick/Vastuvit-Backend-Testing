// dto/create-task.dto.ts - UPDATED to include assignedBy
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  IsMongoId,
} from '@nestjs/class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string; // Manager who created the task

  @IsNotEmpty()
  @IsMongoId()
  firmId: string;

  @IsNotEmpty()
  @IsMongoId()
  projectId: string;

  @IsOptional()
  @IsString()
  assignerRemark?: string;

  @IsOptional()
  @IsString()
  timeTaken?: string;

  @IsNotEmpty()
  @IsMongoId()
  assignTo: string; // Crew member assigned to do the task

  // ADD THESE NEW FIELDS
  @IsOptional()
  @IsMongoId()
  assignedBy?: string; // Who actually assigned the task (could be manager or crew)

  @IsOptional()
  @IsEnum(['Manager', 'Crew'])
  assignedByModel?: string; // Whether assignedBy is a Manager or Crew member

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value).toISOString() : value))
  endDate: string;

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
  metadata?: string; // JSON string for additional fields
}
