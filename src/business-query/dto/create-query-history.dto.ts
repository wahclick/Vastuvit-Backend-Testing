import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateQueryHistoryDto {
  @IsDateString()
  followUpDate: string;

  @IsDateString()
  nextFollowUpDate: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  assignedBy?: string;
}
