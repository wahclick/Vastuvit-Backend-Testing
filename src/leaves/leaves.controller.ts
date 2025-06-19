// src/leave/leave.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { LeaveService } from './leaves.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createLeave(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.createLeave(createLeaveDto);
  }

  @Get()
  getAllLeaves(
    @Query('firmId') firmId?: string,
    @Query('crewId') crewId?: string,
  ) {
    if (firmId && crewId) {
      return this.leaveService.getLeavesByFirmAndCrewId(firmId, crewId);
    } else if (firmId) {
      return this.leaveService.getLeavesByFirmId(firmId);
    } else if (crewId) {
      return this.leaveService.getLeavesByCrewId(crewId);
    }
    return this.leaveService.getAllLeaves();
  }

  @Get(':id')
  getLeaveById(@Param('id') id: string) {
    return this.leaveService.getLeaveById(id);
  }

  @Patch(':id')
  updateLeave(@Param('id') id: string, @Body() updateLeaveDto: UpdateLeaveDto) {
    return this.leaveService.updateLeave(id, updateLeaveDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLeave(@Param('id') id: string) {
    return this.leaveService.deleteLeave(id);
  }

  @Post(':id/approve')
  approveLeaveRequest(
    @Param('id') id: string,
    @Body('managerId') managerId: string,
  ) {
    return this.leaveService.approveLeaveRequest(id, managerId);
  }

  @Post(':id/reject')
  rejectLeaveRequest(
    @Param('id') id: string,
    @Body('managerId') managerId: string,
    @Body('reason') reason: string,
  ) {
    return this.leaveService.rejectLeaveRequest(id, managerId, reason);
  }
}
