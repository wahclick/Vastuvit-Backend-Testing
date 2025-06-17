import { IsString, IsOptional, IsIn, Matches } from '@nestjs/class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @IsOptional()
  @IsString()
  @IsIn(['present', 'absent', 'late', 'leave', 'holiday'])
  status?: 'present' | 'absent' | 'late' | 'leave' | 'holiday';

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'loggedIn must be in HH:mm:ss format',
  })
  loggedIn?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'loggedOut must be in HH:mm:ss format',
  })
  loggedOut?: string;
}
