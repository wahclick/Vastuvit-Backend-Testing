import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ProformaInvoicesService } from './proforma-invoices.service';
import { CreateProformaInvoiceDto } from './dto/create-proforma-invoice.dto';
import { UpdateProformaInvoiceDto } from './dto/update-proforma-invoice.dto';

@Controller('proforma-invoices')
export class ProformaInvoicesController {
  constructor(
    private readonly proformaInvoicesService: ProformaInvoicesService,
  ) {}

  @Post()
  async create(
    @Body(ValidationPipe) createProformaInvoiceDto: CreateProformaInvoiceDto,
  ) {
    return this.proformaInvoicesService.create(createProformaInvoiceDto);
  }

  @Get()
  async findAll(
    @Query('firmId') firmId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (!firmId) {
      throw new BadRequestException('firmId is required');
    }
    return this.proformaInvoicesService.findAll(firmId, page, limit);
  }

  @Get('stats/:firmId')
  async getStats(@Param('firmId') firmId: string) {
    return this.proformaInvoicesService.getProformaInvoiceStats(firmId);
  }

  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.proformaInvoicesService.findByClient(clientId);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.proformaInvoicesService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.proformaInvoicesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProformaInvoiceDto: UpdateProformaInvoiceDto,
  ) {
    return this.proformaInvoicesService.update(id, updateProformaInvoiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.proformaInvoicesService.remove(id);
  }
  @Get('generate-number/:firmId')
  async generateProformaNumber(@Param('firmId') firmId: string) {
    const proformaNumber =
      await this.proformaInvoicesService.generateProformaNumber(firmId);
    return { proformaNumber };
  }
}
