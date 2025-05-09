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
import { RanksService } from './ranks.service';
import { CreateRankDto } from './dto/create-rank.dto';
import { UpdateRankDto } from './dto/update-rank.dto';
import { Types } from 'mongoose';

@Controller('ranks') // Remove this line if you don't have auth implemented yet
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Post()
  create(@Body() createRankDto: CreateRankDto) {
    return this.ranksService.create(createRankDto);
  }

  @Get()
  findAll(@Query('firmId') firmId: string) {
    return this.ranksService.findAll(new Types.ObjectId(firmId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ranksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRankDto: UpdateRankDto) {
    return this.ranksService.update(id, updateRankDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ranksService.remove(id);
  }

  @Patch(':id/toggle')
  toggleEnabled(@Param('id') id: string) {
    return this.ranksService.toggleEnabled(id);
  }
}
