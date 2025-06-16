import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
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

  @Patch(':id/office-timing')
  async updateOfficeTiming(@Param('id') id: string, @Body() data: any) {
    return this.firmsService.updateOfficeTiming(id, data);
  }

  @Get(':id/office-timing')
  async getOfficeTiming(@Param('id') id: string) {
    return this.firmsService.getOfficeTiming(id);
  }

  @Patch(':id/profit-settings')
  async updateProfitSettings(@Param('id') id: string, @Body() data: any) {
    return this.firmsService.updateProfitPercentage(id, data);
  }

  @Get(':id/profit-settings')
  async getProfitSettings(@Param('id') id: string) {
    return this.firmsService.getProfitSettings(id);
  }

  // Threshold Limit endpoints
  @Patch(':id/threshold-settings')
  async updateThresholdSettings(@Param('id') id: string, @Body() data: any) {
    return this.firmsService.updateThresholdLimit(id, data);
  }

  @Get(':id/threshold-settings')
  async getThresholdSettings(@Param('id') id: string) {
    return this.firmsService.getThresholdSettings(id);
  }

  @Patch(':id/overtime-settings')
  async updateOvertimeSettings(@Param('id') id: string, @Body() data: any) {
    return this.firmsService.updateOvertimeSettings(id, data);
  }

  @Get(':id/overtime-settings')
  async getOvertimeSettings(@Param('id') id: string) {
    return this.firmsService.getOvertimeSettings(id);
  }

  // Project Code settings endpoints
  @Patch(':id/project-code-settings')
  async updateProjectCodeSettings(@Param('id') id: string, @Body() data: any) {
    return this.firmsService.updateProjectCodeSettings(id, data);
  }

  @Get(':id/project-code-settings')
  async getProjectCodeSettings(@Param('id') id: string) {
    return this.firmsService.getProjectCodeSettings(id);
  }

  @Get(':id/holidays/:year')
  async getHolidays(@Param('id') id: string, @Param('year') year: number) {
    return this.firmsService.getHolidays(id, year);
  }

  @Patch(':id/holidays/:year/statutory')
  async updateStatutoryHolidays(
    @Param('id') id: string,
    @Param('year') year: number,
    @Body() data: any,
  ) {
    return this.firmsService.updateStatutoryHolidays(id, year, data);
  }

  @Post(':id/holidays/:year/:type')
  async addHoliday(
    @Param('id') id: string,
    @Param('year') year: number,
    @Param('type') type: string,
    @Body() data: any,
  ) {
    return this.firmsService.addHoliday(id, year, type, data);
  }

  @Delete(':id/holidays/:year/:type/:holidayId')
  async removeHoliday(
    @Param('id') id: string,
    @Param('year') year: number,
    @Param('type') type: string,
    @Param('holidayId') holidayId: string,
  ) {
    return this.firmsService.removeHoliday(id, year, type, holidayId);
  }

  @Post(':id/holidays/:year/special-working-days')
  async addSpecialWorkingDay(
    @Param('id') id: string,
    @Param('year') year: number,
    @Body() data: any,
  ) {
    return this.firmsService.addSpecialWorkingDay(id, year, data);
  }

  @Delete(':id/holidays/:year/special-working-days/:specialDayId')
  async removeSpecialWorkingDay(
    @Param('id') id: string,
    @Param('year') year: number,
    @Param('specialDayId') specialDayId: string,
  ) {
    return this.firmsService.removeSpecialWorkingDay(id, year, specialDayId);
  }

  @Patch(':id/holidays/:year/totals')
  async updateHolidayTotals(
    @Param('id') id: string,
    @Param('year') year: number,
    @Body() data: any,
  ) {
    return this.firmsService.updateHolidayTotals(id, year, data);
  }

  // PRINT PRICE ENDPOINTS - FIXED (No duplicates)
  
  @Get(':id/print-prices')
  async getPrintPrices(@Param('id') id: string) {
    return this.firmsService.getPrintPriceSettings(id);
  }

  @Patch(':id/print-prices')
  async updateBulkPrintPrices(@Param('id') id: string, @Body() data: any) {
    return this.firmsService.updatePrintPriceSettings(id, data);
  }

  @Post(':id/print-prices')
  async createOrUpdatePrintPrice(
    @Param('id') id: string,
    @Body() data: { printSize: string; printType: string; cost: number },
  ) {
    const { printSize, printType, cost } = data;
    return this.firmsService.updateSpecificPrintPrice(id, printSize, printType, cost);
  }

  @Put(':id/print-prices/:size/:type')
  async updateSpecificPrintPrice(
    @Param('id') id: string,
    @Param('size') size: string,
    @Param('type') type: string,
    @Body('cost') cost: number,
  ) {
    return this.firmsService.updateSpecificPrintPrice(id, size, type, cost);
  }
}