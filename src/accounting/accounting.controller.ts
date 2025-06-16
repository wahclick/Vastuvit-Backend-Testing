// src/accounting/accounting.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccountingRecord(
    @Body() createAccountingDto: CreateAccountingDto,
  ) {
    return this.accountingService.create(createAccountingDto);
  }

  // SPECIFIC ROUTES FIRST - these must come before generic :id routes
  @Get('firm/:firmId')
  async getAccountingRecordsByFirm(
    @Param('firmId') firmId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    // If no date filters provided, use findAll to get all records
    console.log(firmId);
    if (!startDate && !endDate) {
      return this.accountingService.findAll(firmId);
    }

    const statusArray = status
      ? status.split(',').map((s) => s.trim())
      : undefined;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date();

    return this.accountingService.findByFirmAndDateRange(
      firmId,
      start,
      end,
      statusArray,
    );
  }

  @Get('project/:projectId')
  async getAccountingRecordsByProject(@Param('projectId') projectId: string) {
    return this.accountingService.findByProject(projectId);
  }

  // GENERIC ROUTES LAST - this catches any other :id patterns
  @Get(':id')
  async getAccountingRecordById(@Param('id') id: string) {
    console.log('getAccountingRecordById called with id:', id);
    return this.accountingService.findOne(id);
  }

  @Patch(':id')
  async updateAccountingRecord(
    @Param('id') id: string,
    @Body() updateAccountingDto: UpdateAccountingDto,
  ) {
    return this.accountingService.update(id, updateAccountingDto);
  }

  @Patch(':id/status')
  async updateAccountingRecordStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.accountingService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccountingRecord(@Param('id') id: string) {
    return this.accountingService.remove(id);
  }
}
