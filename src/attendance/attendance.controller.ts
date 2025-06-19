// src/attendance/attendance.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('firm/:firmId')
  findAllByFirm(@Param('firmId') firmId: string) {
    return this.attendanceService.findAllByFirm(firmId);
  }

  @Get('crew/:crewId')
  findByCrew(@Param('crewId') crewId: string) {
    return this.attendanceService.findByCrew(crewId);
  }

  @Get('crew/:crewId/firm/:firmId')
  findByCrewAndFirm(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
  ) {
    return this.attendanceService.findByCrewAndFirm(crewId, firmId);
  }

  @Patch('crew/:crewId/firm/:firmId/date/:date')
  update(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('date') date: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(
      crewId,
      firmId,
      date,
      updateAttendanceDto,
    );
  }

  @Get('crew/:crewId/firm/:firmId/month/:year/:month')
  getMonthlyAttendance(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.attendanceService.getMonthlyAttendance(
      crewId,
      firmId,
      year,
      month,
    );
  }
  @Post('clock-in')
  clockIn(
    @Body('crewId') crewId: string,
    @Body('firmId') firmId: string,
    @Body('date') date: string,
    @Body('time') time: string,
  ) {
    // Validate required parameters
    if (!crewId || !firmId || !date || !time) {
      throw new BadRequestException('Missing required parameters');
    }

    // Create a DTO for the attendance record
    const createDto: CreateAttendanceDto = {
      crew_id: crewId,
      firm_id: firmId,
      date: date,
      status: 'present',
      loggedIn: time,
    };

    return this.attendanceService.create(createDto);
  }

  @Post('clock-out')
  clockOut(
    @Body('crewId') crewId: string,
    @Body('firmId') firmId: string,
    @Body('date') date: string,
    @Body('time') time: string,
  ) {
    return this.attendanceService.clockOut(crewId, firmId, date, time);
  }

  @Get('summary/crew/:crewId/firm/:firmId/:year')
  getYearlySummary(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('year') year: string,
  ) {
    return this.attendanceService.getAttendanceSummary(crewId, firmId, year);
  }

  @Get('summary/crew/:crewId/firm/:firmId/:year/:month')
  getMonthlySummary(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.attendanceService.getAttendanceSummary(
      crewId,
      firmId,
      year,
      month,
    );
  }
}
