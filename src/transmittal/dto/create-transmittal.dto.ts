import {
  IsString,
  IsDateString,
  IsArray,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from '@nestjs/class-validator';
import { Type } from 'class-transformer';

export class DrawingItemDto {
  @IsString()
  @IsNotEmpty()
  drawno: string;

  @IsString()
  @IsNotEmpty()
  drawtitle: string;

  @IsString()
  @IsNotEmpty()
  designdisc: string;

  @IsString()
  @IsNotEmpty()
  designpur: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  scale: string;

  @IsString()
  @IsNotEmpty()
  copy: string;
}

export class CreateTransmittalDto {
  @IsString()
  @IsNotEmpty()
  firmId: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  transno: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  preparedby: string;

  @IsString()
  @IsNotEmpty()
  project: string;

  @IsString()
  @IsNotEmpty()
  client: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'])
  @IsOptional()
  status?: string = 'Pending';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawingItemDto)
  drawings: DrawingItemDto[];
}
