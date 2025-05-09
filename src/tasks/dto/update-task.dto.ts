// update-task.dto.ts
import {
  IsString,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsDateString,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class UpdateTaskDto {
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  firmId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  projectId?: Types.ObjectId;

  @IsString()
  @IsOptional()
  assignerRemark?: string;

  @IsString()
  @IsOptional()
  timeTaken?: string;

  @IsMongoId()
  @IsOptional()
  assignTo?: Types.ObjectId;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  timeLimit?: string;

  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsMongoId()
  @IsOptional()
  taskCheckBy?: Types.ObjectId;

  @IsEnum(['approved', 'rejected', 'pending'])
  @IsOptional()
  remarkStatus?: string;
}
