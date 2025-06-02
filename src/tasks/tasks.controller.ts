// tasks.controller.ts - FIXED ROUTE ORDER
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Types } from 'mongoose';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('create')
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll(@Query('firmId') firmId: string) {
    return this.tasksService.findAll(new Types.ObjectId(firmId));
  }

  // MOVE THIS BEFORE THE :id ROUTE!
  @Get('pending-review')
  async findPendingReviewTasks(
    @Query('firmId') firmId: string,
    @Query('status') status: string = 'complete',
    @Query('remarkStatus') remarkStatus: string = 'pending'
  ) {
    return this.tasksService.findPendingReviewTasks(firmId, status, remarkStatus);
  }

  // MOVE ALL SPECIFIC ROUTES BEFORE PARAMETERIZED ROUTES
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(new Types.ObjectId(projectId));
  }

  @Get('assignee/:assigneeId')
  async findByAssigneeAndFirm(
    @Param('assigneeId') assigneeId: string,
    @Query('firmId') firmId: string,
    @Query('status') status?: string
  ) {
    if (firmId) {
      return this.tasksService.findByFirmAndAssignee(firmId, assigneeId, status);
    }
    return this.tasksService.findByAssignee(new Types.ObjectId(assigneeId));
  }

  // KEEP :id ROUTES AT THE BOTTOM
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Patch(':id/status/:status')
  updateStatus(@Param('id') id: string, @Param('status') status: string) {
    return this.tasksService.updateStatus(id, status);
  }

  @Patch(':id/remark-status')
  updateRemarkStatus(
    @Param('id') id: string,
    @Body('remarkStatus') remarkStatus: string,
    @Body('taskCheckBy') taskCheckBy: string,
  ) {
    return this.tasksService.updateRemarkStatus(
      id,
      remarkStatus,
      new Types.ObjectId(taskCheckBy),
    );
  }
}