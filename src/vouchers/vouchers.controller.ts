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
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VouchersService } from './vouchers.service';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  async create(@Body(ValidationPipe) createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
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
    return this.vouchersService.findAll(firmId, page, limit);
  }
    // New endpoint to get next voucher number
    @Get('next-number/:firmId')
    async getNextVoucherNumber(@Param('firmId') firmId: string) {
      return this.vouchersService.getNextVoucherNumber(firmId);
    }

  @Get('stats/:firmId')
  async getStats(@Param('firmId') firmId: string) {
    return this.vouchersService.getVoucherStats(firmId);
  }

  @Get('date-range/:firmId')
  async findByDateRange(
    @Param('firmId') firmId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ) {
    return this.vouchersService.findByDateRange(
      firmId,
      new Date(fromDate),
      new Date(toDate),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateVoucherDto: UpdateVoucherDto,
  ) {
    return this.vouchersService.update(id, updateVoucherDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.vouchersService.remove(id);
  }
  @Get('generate-number/:firmId')
  async generateVoucherNumber(@Param('firmId') firmId: string) {
    const voucherNumber =
      await this.vouchersService.generateVoucherNumber(firmId);

    return { voucherNumber };
  }
}
