import {
  IsString,
  IsMongoId,
  IsArray,
  IsOptional,
  IsBoolean,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  team_name?: string;

  @IsMongoId()
  @IsOptional()
  team_head?: string | Types.ObjectId;

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
