import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from '@nestjs/class-validator';
import { CreateTransmittalDto } from './create-transmittal.dto';

export class UpdateTransmittalDto extends PartialType(CreateTransmittalDto) {
  @IsEnum(['Pending', 'In Progress', 'Approved', 'Rejected', 'Completed'])
  @IsOptional()
  status?: string;
}
