// src/memos/dto/update-memo.dto.ts
import {
  IsOptional,
  IsString,
  IsMongoId,
  IsBoolean,
  IsDate,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class UpdateMemoDto {
  @IsMongoId()
  @IsOptional()
  assign_to?: Types.ObjectId;

  @IsString()
  @IsOptional()
  remark?: string;
}
