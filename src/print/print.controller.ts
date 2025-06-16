import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PrintService } from './print.service';
import { CreatePrintDto } from './dto/create-print.dto';
import { UpdatePrintDto } from './dto/update-print.dto';
import { PopulatedPrintDto } from './dto/populated-print.dto';

@Controller('prints')
export class PrintController {
  constructor(private readonly printService: PrintService) {}

  @Post()
  create(@Body() createPrintDto: CreatePrintDto) {
    return this.printService.create(createPrintDto);
  }

  @Get()
  findAll(@Query('project_id') projectId?: string): Promise<PopulatedPrintDto[]> {
    if (projectId) {
      return this.printService.findByProject(projectId);
    }
    return this.printService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PopulatedPrintDto> {
    return this.printService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePrintDto: UpdatePrintDto): Promise<PopulatedPrintDto> {
    return this.printService.update(id, updatePrintDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.printService.remove(id);
  }

  @Post('submit-jobs')
  async submitPrintJobs(
    @Body() body: { 
      printJobs: CreatePrintDto[]; 
      userId: string;
    }
  ) {
    return this.printService.submitPrintJobs(body.printJobs, body.userId);
  }

  @Get('general/:firmId')
  async getGeneralPrints(@Param('firmId') firmId: string): Promise<PopulatedPrintDto[]> {
    return this.printService.findGeneralPrints(firmId);
  }
  @Get('project/:projectId')
async getPrintsByProject(@Param('projectId') projectId: string): Promise<PopulatedPrintDto[]> {
  return this.printService.findByProject(projectId);
}
}