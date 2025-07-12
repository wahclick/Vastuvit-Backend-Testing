import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessQueryService } from './business-query.service';
import { CreateBusinessQueryDto } from './dto/create-business-query.dto';
import { BusinessQueryStatus } from './enum/business-query-status.enum';
import { UpdateBusinessQueryDto } from './dto/update-business-query.dto';
import { CreateQueryHistoryDto } from './dto/create-query-history.dto';



@Controller('business-queries')
export class BusinessQueryController {
  constructor(private readonly businessQueryService: BusinessQueryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBusinessQueryDto: CreateBusinessQueryDto) {
    return this.businessQueryService.create(createBusinessQueryDto);
  }

  @Get()
  findAll(@Query('status') status?: BusinessQueryStatus) {
    if (status) {
      return this.businessQueryService.findByStatus(status);
    }
    return this.businessQueryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessQueryService.findOne(id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.businessQueryService.findByUserId(userId);
  }

  @Get('firm/:firmId')
  findByFirmId(@Param('firmId') firmId: string) {
    return this.businessQueryService.findByFirmId(firmId);
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.businessQueryService.findByClientId(clientId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBusinessQueryDto: UpdateBusinessQueryDto) {
    return this.businessQueryService.update(id, updateBusinessQueryDto);
  }

  @Post(':id/query-history')
  addQueryHistory(
    @Param('id') id: string,
    @Body() createQueryHistoryDto: CreateQueryHistoryDto
  ) {
    return this.businessQueryService.addQueryHistory(id, createQueryHistoryDto);
  }

  @Get(':id/query-history')
  getQueryHistory(@Param('id') id: string) {
    return this.businessQueryService.getQueryHistory(id);
  }

  @Patch(':id/query-history/:historyId')
  updateQueryHistory(
    @Param('id') id: string,
    @Param('historyId') historyId: string,
    @Body() createQueryHistoryDto: CreateQueryHistoryDto
  ) {
    return this.businessQueryService.updateQueryHistory(id, historyId, createQueryHistoryDto);
  }

  @Delete(':id/query-history/:historyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQueryHistory(
    @Param('id') id: string,
    @Param('historyId') historyId: string
  ) {
    return this.businessQueryService.deleteQueryHistory(id, historyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.businessQueryService.remove(id);
  }
}