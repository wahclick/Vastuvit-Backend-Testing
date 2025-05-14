// src/memos/memos.controller.ts
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
import { MemosService } from './memos.service';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { Types } from 'mongoose';

@Controller('memos')
export class MemosController {
  constructor(private readonly memosService: MemosService) {}

  @Post('createMemo')
  createMemo(@Body() createMemoDto: CreateMemoDto) {
    return this.memosService.createMemo(createMemoDto); // Updated
  }

  @Get('getAllMemos')
  getAllMemos(@Query('firmId') firmId: string) {
    return this.memosService.getAllMemosByFirm(new Types.ObjectId(firmId)); // Updated
  }

  @Get('project/:projectId')
  getMemosByProject(@Param('projectId') projectId: string) {
    return this.memosService.getMemosByProject(new Types.ObjectId(projectId)); // Updated
  }

  @Get('assignee/:assigneeId')
  getMemosByAssignee(@Param('assigneeId') assigneeId: string) {
    return this.memosService.getMemosByAssignee(new Types.ObjectId(assigneeId)); // Updated
  }

  @Get('assigner/:assignerId')
  getMemosByAssigner(@Param('assignerId') assignerId: string) {
    return this.memosService.getMemosByAssigner(new Types.ObjectId(assignerId)); // Updated
  }

  @Get(':id')
  getMemoById(@Param('id') id: string) {
    return this.memosService.getMemoById(id); // Updated
  }

  @Delete(':id')
  deleteMemo(@Param('id') id: string) {
    return this.memosService.deleteMemo(id); // Updated
  }
}
