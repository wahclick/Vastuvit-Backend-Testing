// crew.controller.ts
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
import { CrewService } from './crew.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { Types } from 'mongoose';


@Controller('crew')
export class CrewController {
  constructor(private readonly crewService: CrewService) {}

  @Post('create')
  create(@Body() createCrewDto: CreateCrewDto) {
    return this.crewService.create(createCrewDto);
  }

  @Get()
  findAll(@Query('firmId') firmId: string) {
    return this.crewService.findAll(new Types.ObjectId(firmId));
  }

  @Get('rank/:rankId')
  findByRank(@Query('firmId') firmId: string, @Param('rankId') rankId: string) {
    return this.crewService.findByFirmAndRank(
      new Types.ObjectId(firmId),
      new Types.ObjectId(rankId),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crewService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCrewDto: UpdateCrewDto) {
    return this.crewService.update(id, updateCrewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.crewService.remove(id);
  }
}
