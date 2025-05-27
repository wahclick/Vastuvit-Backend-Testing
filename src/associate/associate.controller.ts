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
import { AssociateService } from './associate.service';
import { CreateAssociateDto } from './dto/create-associate.dto';
import { UpdateAssociateDto } from './dto/update-associate.dto';

@Controller('associates')
export class AssociateController {
  constructor(private readonly associateService: AssociateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAssociate(@Body() createAssociateDto: CreateAssociateDto) {
    return this.associateService.createAssociate(createAssociateDto);
  }

  @Get('firm/:firmId')
  async findAssociatesByFirm(@Param('firmId') firmId: string) {
    return this.associateService.findAssociatesByFirm(firmId);
  }

  @Get('export/:firmId')
  async exportAssociates(@Param('firmId') firmId: string) {
    return this.associateService.exportAssociates(firmId);
  }

  @Get(':id')
  async findAssociateById(@Param('id') id: string) {
    return this.associateService.findAssociateById(id);
  }

  @Patch(':id')
  async updateAssociate(
    @Param('id') id: string,
    @Body() updateAssociateDto: UpdateAssociateDto,
  ) {
    return this.associateService.updateAssociate(id, updateAssociateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAssociate(@Param('id') id: string) {
    return this.associateService.deleteAssociate(id);
  }

  @Patch(':id/status')
  async updateAssociateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.associateService.updateAssociateStatus(id, status);
  }
}
