// src/attendance/attendance.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  BadRequestException,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    try {
      return await this.attendanceService.create(createAttendanceDto);
    } catch (error) {
      console.error('Controller - Create attendance error:', error);
      throw new InternalServerErrorException('Failed to create attendance record');
    }
  }

  @Get('firm/:firmId')
  async findAllByFirm(@Param('firmId') firmId: string) {
    if (!firmId) {
      throw new BadRequestException('Firm ID is required');
    }
    return await this.attendanceService.findAllByFirm(firmId);
  }

  @Get('crew/:crewId')
  async findByCrew(@Param('crewId') crewId: string) {
    if (!crewId) {
      throw new BadRequestException('Crew ID is required');
    }
    return await this.attendanceService.findByCrew(crewId);
  }

  @Get('crew/:crewId/firm/:firmId')
  async findByCrewAndFirm(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
  ) {
    if (!crewId || !firmId) {
      throw new BadRequestException('Both Crew ID and Firm ID are required');
    }
    return await this.attendanceService.findByCrewAndFirm(crewId, firmId);
  }

  @Patch('crew/:crewId/firm/:firmId/date/:date')
  async update(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('date') date: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    if (!crewId || !firmId || !date) {
      throw new BadRequestException('Crew ID, Firm ID, and Date are required');
    }
    return await this.attendanceService.update(
      crewId,
      firmId,
      date,
      updateAttendanceDto,
    );
  }

  @Get('crew/:crewId/firm/:firmId/month/:year/:month')
  async getMonthlyAttendance(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    if (!crewId || !firmId || !year || !month) {
      throw new BadRequestException('All parameters are required');
    }
    return await this.attendanceService.getMonthlyAttendance(
      crewId,
      firmId,
      year,
      month,
    );
  }

  @Post('clock-in')
  @HttpCode(HttpStatus.CREATED)
  async clockIn(
    @Body('crewId') crewId: string,
    @Body('firmId') firmId: string,
    @Body('date') date: string,
    @Body('time') time: string,
  ) {
    // Validate required parameters
    if (!crewId || !firmId || !date || !time) {
      throw new BadRequestException('Missing required parameters: crewId, firmId, date, and time are all required');
    }

    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException('Date must be in DD-MM-YYYY format');
    }

    // Validate time format (HH:MM:SS)
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException('Time must be in HH:MM:SS format');
    }

    try {
      console.log('Clock-in request:', { crewId, firmId, date, time });
      
      // Create a DTO for the attendance record
      const createDto: CreateAttendanceDto = {
        crew_id: crewId,
        firm_id: firmId,
        date: date,
        status: 'present',
        loggedIn: time,
      };

      const result = await this.attendanceService.create(createDto);
      
      return {
        success: true,
        message: 'Clock-in recorded successfully',
        data: result
      };
    } catch (error) {
      console.error('Clock-in error:', error);
      throw new InternalServerErrorException(`Failed to record clock-in: ${error.message}`);
    }
  }

  @Post('clock-out')
  @HttpCode(HttpStatus.OK)
  async clockOut(
    @Body('crewId') crewId: string,
    @Body('firmId') firmId: string,
    @Body('date') date: string,
    @Body('time') time: string,
  ) {
    // Validate required parameters
    if (!crewId || !firmId || !date || !time) {
      throw new BadRequestException('Missing required parameters: crewId, firmId, date, and time are all required');
    }

    // Validate date format (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException('Date must be in DD-MM-YYYY format');
    }

    // Validate time format (HH:MM:SS)
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException('Time must be in HH:MM:SS format');
    }

    try {
      const result = await this.attendanceService.clockOut(crewId, firmId, date, time);
      
      return {
        success: true,
        message: 'Clock-out recorded successfully',
        data: result
      };
    } catch (error) {
      console.error('Clock-out error:', error);
      throw new InternalServerErrorException(`Failed to record clock-out: ${error.message}`);
    }
  }

  @Get('summary/crew/:crewId/firm/:firmId/:year')
  async getYearlySummary(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('year') year: string,
  ) {
    if (!crewId || !firmId || !year) {
      throw new BadRequestException('Crew ID, Firm ID, and Year are required');
    }
    return await this.attendanceService.getAttendanceSummary(crewId, firmId, year);
  }

  @Get('summary/crew/:crewId/firm/:firmId/:year/:month')
  async getMonthlySummary(
    @Param('crewId') crewId: string,
    @Param('firmId') firmId: string,
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    if (!crewId || !firmId || !year || !month) {
      throw new BadRequestException('All parameters are required');
    }
    return await this.attendanceService.getAttendanceSummary(
      crewId,
      firmId,
      year,
      month,
    );
  }
  
}