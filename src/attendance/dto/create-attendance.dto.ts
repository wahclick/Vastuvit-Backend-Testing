// src/attendance/dto/create-attendance.dto.ts
import {
  IsString,
  IsMongoId,
  IsIn,
  IsOptional,
  Matches,
} from '@nestjs/class-validator';
import { Types } from 'mongoose';

export class CreateAttendanceDto {
  @IsMongoId()
  firm_id: string | Types.ObjectId;

  @IsMongoId()
  crew_id: string | Types.ObjectId;

  @IsString()
  @Matches(/^\d{2}-\d{2}-\d{4}$/, {
    message: 'date must be in DD-MM-YYYY format',
  })
  date: string;

  @IsString()
  @IsIn(['present', 'absent', 'late', 'leave', 'holiday'])
  status: 'present' | 'absent' | 'late' | 'leave' | 'holiday';

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'loggedIn must be in HH:mm:ss format',
  })
  loggedIn: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'loggedOut must be in HH:mm:ss format',
  })
  loggedOut?: string;
}
