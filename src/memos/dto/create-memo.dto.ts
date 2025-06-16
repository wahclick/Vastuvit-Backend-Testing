// src/memos/dto/create-memo.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsOptional,
  IsBoolean,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class CreateMemoDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  firmId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  projectId: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  assign_to?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  assigned_by?: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  remark: string;

}
