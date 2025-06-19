import { IsString, IsOptional } from '@nestjs/class-validator';

export class UpdateOfficeTimingDto {
  @IsString()
  opening: string;

  @IsString()
  closing: string;

  @IsOptional()
  @IsString()
  lunchStart?: string;

  @IsOptional()
  @IsString()
  lunchEnd?: string;
}
