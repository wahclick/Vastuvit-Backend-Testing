// transmittal.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TransmittalService } from './transmittal.service';
import { CreateTransmittalDto } from './dto/create-transmittal.dto';
import { UpdateTransmittalDto } from './dto/update-transmittal.dto';
import { QueryTransmittalDto } from './dto/query-transmittal.dto';

@Controller('transmittals')
export class TransmittalController {
  constructor(private readonly transmittalService: TransmittalService) {}

  // Create a new transmittal
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTransmittalDto: CreateTransmittalDto) {
    return await this.transmittalService.create(createTransmittalDto);
  }

  // Get all transmittals with optional filtering
  @Get()
  async findAll(@Query() queryDto: QueryTransmittalDto) {
    return await this.transmittalService.findAll(queryDto);
  }

  // Get transmittals by firm
  @Get('firm/:firmId')
  async findByFirm(@Param('firmId') firmId: string) {
    return await this.transmittalService.findByFirm(firmId);
  }

  // Get transmittals by project
  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return await this.transmittalService.findByProject(projectId);
  }

  // Get transmittal statistics
  @Get('stats')
  async getStats(
    @Query('firmId') firmId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.transmittalService.getTransmittalStats(firmId, projectId);
  }

  // Search transmittals
  @Get('search')
  async search(
    @Query('term') searchTerm: string,
    @Query('firmId') firmId?: string,
  ) {
    return await this.transmittalService.searchTransmittals(searchTerm, firmId);
  }

  // Get a specific transmittal by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.transmittalService.findOne(id);
  }

  // Update a transmittal
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTransmittalDto: UpdateTransmittalDto,
  ) {
    return await this.transmittalService.update(id, updateTransmittalDto);
  }

  // Update only the status of a transmittal
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return await this.transmittalService.updateStatus(id, status);
  }

  // Delete a transmittal
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.transmittalService.remove(id);
  }
}
