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
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateAccountingDto } from './dto/create-accounting.dto';
import { UpdateAccountingDto } from './dto/update-accounting.dto';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAccountingDto: CreateAccountingDto) {
    return this.accountingService.create(createAccountingDto);
  }

  @Get('firm/:firmId')
  async findByFirm(@Param('firmId') firmId: string) {
    return this.accountingService.findAll(firmId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.accountingService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountingDto: UpdateAccountingDto,
  ) {
    return this.accountingService.update(id, updateAccountingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.accountingService.remove(id);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.accountingService.findByProject(projectId);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.accountingService.updateStatus(id, status);
  }
}
