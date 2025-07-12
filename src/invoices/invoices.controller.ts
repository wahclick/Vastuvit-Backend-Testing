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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body(ValidationPipe) createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
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
    return this.invoicesService.findAll(firmId, page, limit);
  }

  @Get('stats/:firmId')
  async getStats(@Param('firmId') firmId: string) {
    return this.invoicesService.getInvoiceStats(firmId);
  }

  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.invoicesService.findByClient(clientId);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.invoicesService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.invoicesService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }

  @Get('generate-number/:firmId')
  async generateInvoiceNumber(@Param('firmId') firmId: string) {
    const invoiceNumber =
      await this.invoicesService.generateInvoiceNumber(firmId);
      console.log(invoiceNumber)
    return { invoiceNumber };
  }
}
