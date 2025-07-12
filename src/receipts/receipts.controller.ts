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
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  async create(@Body(ValidationPipe) createReceiptDto: CreateReceiptDto) {
    return this.receiptsService.create(createReceiptDto);
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
    return this.receiptsService.findAll(firmId, page, limit);
  }

  @Get('stats/:firmId')
  async getStats(@Param('firmId') firmId: string) {
    return this.receiptsService.getReceiptStats(firmId);
  }

  @Get('client/:clientId')
  async findByClient(@Param('clientId') clientId: string) {
    return this.receiptsService.findByClient(clientId);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.receiptsService.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateReceiptDto: UpdateReceiptDto,
  ) {
    return this.receiptsService.update(id, updateReceiptDto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.receiptsService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.receiptsService.remove(id);
  }
  @Get('generate-number/:firmId')
  async generateReceiptNumber(@Param('firmId') firmId: string) {
    const invoiceNumber =
      await this.receiptsService.generateReceiptNumber(firmId);
    console.log(invoiceNumber);
    return { invoiceNumber };
  }
}
