import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { FirmsService } from './firms.service';
import { CreateFirmDto } from './dto/create-firm.dto';
import { UpdateLeaveSettingDto } from './dto/update-leave-seettings.dto';

@Controller('firms')
export class FirmsController {
  constructor(private readonly firmsService: FirmsService) {}

  // Existing endpoints
  @Post()
  async create(@Body() createFirmDto: CreateFirmDto) {
    return this.firmsService.create(createFirmDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.firmsService.findById(id);
  }

  // New endpoint for toggling leave settings
  @Put(':id/leave-setting')
  async toggleLeaveSetting(
    @Param('id') id: string,
    @Body() updateLeaveSettingDto: UpdateLeaveSettingDto,
  ) {
    return this.firmsService.toggleLeaveSetting(id, updateLeaveSettingDto);
  }

  @Get(':id/leave-settings')
  async getLeaveSettings(@Param('id') id: string) {
    return this.firmsService.getLeaveSettings(id);
  }
}
