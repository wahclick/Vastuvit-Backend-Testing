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
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVendor(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.createVendor(createVendorDto);
  }

  @Get('firm/:firmId')
  async findVendorsByFirm(@Param('firmId') firmId: string) {
    return this.vendorService.findVendorsByFirm(firmId);
  }

  @Get('firm/:firmId/type/:type')
  async findVendorsByType(
    @Param('firmId') firmId: string,
    @Param('type') type: string,
  ) {
    return this.vendorService.findVendorsByType(firmId, type);
  }

  @Get('export/:firmId')
  async exportVendors(@Param('firmId') firmId: string) {
    return this.vendorService.exportVendors(firmId);
  }

  @Get(':id')
  async findVendorById(@Param('id') id: string) {
    return this.vendorService.findVendorById(id);
  }

  @Patch(':id')
  async updateVendor(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorService.updateVendor(id, updateVendorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVendor(@Param('id') id: string) {
    return this.vendorService.deleteVendor(id);
  }

  @Patch(':id/status')
  async updateVendorStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.vendorService.updateVendorStatus(id, status);
  }
}
