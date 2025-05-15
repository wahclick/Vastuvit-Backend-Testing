// create-task.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsDateString,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';



export class CreateTaskDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  firmId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  projectId: Types.ObjectId;

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
  priority?: string = 'medium';

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  timeLimit?: string;

  @IsEnum(['pending', 'in-progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string = 'pending';

  @IsMongoId()
  @IsOptional()
  taskCheckBy?: Types.ObjectId;

  @IsEnum(['approved', 'rejected', 'pending'])
  @IsOptional()
  remarkStatus?: string = 'pending';

  @IsString()
  @IsOptional()
  metadata?: string; // JSON string for additional fields
}
