import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Types } from 'mongoose';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@Query('firmId') firmId: string) {
    return this.projectsService.findAll(new Types.ObjectId(firmId));
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.projectsService.findByClient(new Types.ObjectId(clientId));
  }

  @Get('manager/:userId')
  findByManager(@Param('userId') userId: string) {
    return this.projectsService.findByManager(new Types.ObjectId(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Patch(':id/toggle')
  toggleEnabled(@Param('id') id: string) {
    return this.projectsService.toggleEnabled(id);
  }

  @Post(':id/site-visits')
  addSiteVisit(@Param('id') id: string, @Body() siteVisitData: any) {
    return this.projectsService.addSiteVisit(id, siteVisitData);
  }

  @Post(':id/billing-stages')
  addBillingStage(@Param('id') id: string, @Body() billingStageData: any) {
    return this.projectsService.addBillingStage(id, billingStageData);
  }
}
