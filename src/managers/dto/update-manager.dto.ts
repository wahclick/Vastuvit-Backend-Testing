// dto/update-manager.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';

class SalaryHistoryDto {
  @IsNumber()
  amount: number;

  @IsString()
  date: string;

  @IsEnum(['increment', 'initial'])
  changeType: 'increment' | 'initial';

  @IsString()
  previous: string;
}

class LeaveBalancesDto {
  @IsOptional()
  @IsNumber()
  el?: number;

  @IsOptional()
  @IsNumber()
  cl?: number;

  @IsOptional()
  @IsNumber()
  sl?: number;

  @IsOptional()
  @IsNumber()
  shl?: number;

  @IsOptional()
  @IsNumber()
  ml?: number;

  @IsOptional()
  @IsNumber()
  pl?: number;

  @IsOptional()
  @IsNumber()
  mgl?: number;

  @IsOptional()
  @IsNumber()
  bl?: number;

  @IsOptional()
  @IsNumber()
  lop?: number;

  @IsOptional()
  @IsNumber()
  ph?: number;

  @IsOptional()
  @IsNumber()
  co?: number;
}

export class UpdateManagerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  emp_id?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  additionalNumber?: string;

  @IsOptional()
  @IsDateString()
  dateOfJoining?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsDateString()
  dateOfAnniversary?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryHistoryDto)
  salaryHistory?: SalaryHistoryDto[];

  @IsOptional()
  @IsNumber()
  historyLength?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => LeaveBalancesDto)
  leave_balances?: LeaveBalancesDto;

  @IsOptional()
  @IsString()
  role?: string;

  // Special field for adding salary history entry
  @IsOptional()
  @ValidateNested()
  @Type(() => SalaryHistoryDto)
  $push?: { salaryHistory: SalaryHistoryDto };
}
