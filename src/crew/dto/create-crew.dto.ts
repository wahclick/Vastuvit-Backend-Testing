import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsNumber,
  IsEmail,
  IsDateString,
  IsBoolean,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class CreateCrewDto {
  @IsMongoId()
  @IsNotEmpty()
  firmId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  rankId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  designationId: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  salary: number;

  @IsDateString()
  @IsNotEmpty()
  dateOfJoining: Date;

  @IsDateString()
  @IsOptional()
  dateOfAnniversary?: Date;

  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsString()
  @IsOptional()
  additionalNumber?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsString()
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean = true;
}