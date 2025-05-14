// src/leave/dto/update-leave.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveDto } from './create-leave.dto';
import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {
  @IsString()
  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: string;

  @IsMongoId()
  @IsOptional()
  approved_by?: string;

  @IsString()
  @IsOptional()
  rejection_reason?: string;
}
