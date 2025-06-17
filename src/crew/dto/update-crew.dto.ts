import {
  IsString,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsEmail,
  IsDateString,
  IsBoolean,
  IsNotEmpty
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class UpdateCrewDto {
  @IsMongoId()
  @IsOptional()
  firmId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  rankId?: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  designationId?: Types.ObjectId;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsDateString()
  @IsOptional()
  dateOfJoining?: Date;

  @IsDateString()
  @IsOptional()
  dateOfAnniversary?: Date;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  additionalNumber?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
