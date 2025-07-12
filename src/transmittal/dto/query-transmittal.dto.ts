import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
} from '@nestjs/class-validator';

export class QueryTransmittalDto {
  @IsOptional()
  @IsString()
  firmId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'])
  status?: string;

  @IsOptional()
  @IsString()
  preparedby?: string;

  @IsOptional()
  @IsString()
  transno?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
