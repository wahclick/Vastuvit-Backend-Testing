import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { Types } from 'mongoose';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@Controller('designations')
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Post('')
  create(@Body() createDesignationDto: CreateDesignationDto) {
    return this.designationsService.create(createDesignationDto);
  }
  @Get()
  findAll(@Query('firmId') firmId: string) {
    return this.designationsService.findAll(new Types.ObjectId(firmId));
  }

  @Get('rank/:rankId')
  findByRank(@Param('rankId') rankId: string) {
    return this.designationsService.findByRank(new Types.ObjectId(rankId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.designationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDesignationDto: UpdateDesignationDto,
  ) {
    return this.designationsService.update(id, updateDesignationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.designationsService.remove(id);
  }

  @Patch(':id/toggle')
  toggleEnabled(@Param('id') id: string) {
    return this.designationsService.toggleEnabled(id);
  }
}
