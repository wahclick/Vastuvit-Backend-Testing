// src/leave/dto/create-leave.dto.ts
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
} from '@nestjs/class-validator';
import { LeaveType } from '../schema/leave.schema';

export class CreateLeaveDto {
  @IsMongoId()
  @IsNotEmpty()
  firm_id: string;

  @IsMongoId()
  @IsNotEmpty()
  crew_id: string;

  @IsEnum(LeaveType)
  @IsNotEmpty()
  leave_type: LeaveType;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
