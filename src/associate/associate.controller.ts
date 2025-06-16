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
import { AssignProjectDto } from './dto/assign-project.dto';

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

  // MISSING PROJECT ASSIGNMENT ENDPOINTS - ADD THESE:

  @Post(':id/projects')
  @HttpCode(HttpStatus.CREATED)
  async assignProject(
    @Param('id') associateId: string,
    @Body() assignProjectDto: AssignProjectDto,
  ) {
    return this.associateService.assignProjectToAssociate(associateId, assignProjectDto);
  }

  @Get(':id/projects')
  async getAssociateProjects(@Param('id') associateId: string) {
    return this.associateService.getAssociateProjects(associateId);
  }

  @Patch(':id/projects/:projectId')
  async updateProjectAssignment(
    @Param('id') associateId: string,
    @Param('projectId') projectId: string,
    @Body() updateData: Partial<AssignProjectDto>,
  ) {
    return this.associateService.updateProjectAssignment(
      associateId,
      projectId,
      updateData,
    );
  }

  @Delete(':id/projects/:projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProjectAssignment(
    @Param('id') associateId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.associateService.removeProjectAssignment(associateId, projectId);
  }

  @Get('projects/:projectId/associates')
  async getProjectAssociates(@Param('projectId') projectId: string) {
    return this.associateService.getProjectAssociates(projectId);
  }
}