// src/team/dto/create-team.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsArray,
  IsOptional,
  IsBoolean,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class CreateTeamDto {
  @IsMongoId()
  @IsNotEmpty()
  firmId: string | Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  userId: string | Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  team_name: string;

  @IsMongoId()
  @IsNotEmpty()
  team_head: string | Types.ObjectId;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  assigned_projects?: string[] | Types.ObjectId[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  assigned_members?: string[] | Types.ObjectId[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
