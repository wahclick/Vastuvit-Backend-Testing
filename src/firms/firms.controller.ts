import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FirmsService } from './firms.service';
import { CreateFirmDto } from './dto/create-firm.dto';
import { Types } from 'mongoose';

@Controller('firms')
export class FirmsController {
  constructor(private readonly firmService: FirmsService) {}

  @Post()
  async create(@Body() createFirmDto: CreateFirmDto) {
    return this.firmService.create(createFirmDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.firmService.findById(id);
  }

  @Get('owner/:ownerId')
  async findByOwner(@Param('ownerId') ownerId: string) {
    return this.firmService.findByOwnerId(new Types.ObjectId(ownerId));
  }
}
