import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/projects/create-project.dto';
import mongoose, { Model, Types } from 'mongoose';
import { UpdateProjectDto } from './dto/projects/update-project.dto';
import { CreateProjectDetailDto } from './dto/projectsDetails/project-details.dto';
import { UpdateProjectDetailDto } from './dto/projectsDetails/update-project-detail.dto';
import { QueryProjectDetailDto } from './dto/projectsDetails/query-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProjectDocument } from './schemas/projects.schema';

@Controller('projects')
export class ProjectsController {
  constructor(
    @InjectModel('Project') private projectModel: Model<ProjectDocument>,
    private readonly projectsService: ProjectsService,
  ) {}

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
  @Post(':id/details')
  async addProjectDetail(
    @Param('id') id: string,
    @Body() createProjectDetailDto: CreateProjectDetailDto,
  ) {
    return this.projectsService.addProjectDetail(id, createProjectDetailDto);
  }

  // Get project details with filtering
  @Get(':id/details')
  async getProjectDetails(
    @Param('id') id: string,
    @Query() queryDto: QueryProjectDetailDto,
  ) {
    return this.projectsService.getProjectDetails(id, queryDto);
  }

  // Get a specific project detail
  @Get(':id/details/:detailId')
  async getProjectDetail(
    @Param('id') id: string,
    @Param('detailId') detailId: string,
  ) {
    const details = await this.projectsService.getProjectDetails(id, {});
    const detail = details.find((d) => d._id.toString() === detailId);

    if (!detail) {
      throw new NotFoundException(
        `Project detail with ID ${detailId} not found`,
      );
    }

    return detail;
  }

  // Update a project detail
  @Patch(':id/details/:detailId')
  async updateProjectDetail(
    @Param('id') id: string,
    @Param('detailId') detailId: string,
    @Body() updateProjectDetailDto: UpdateProjectDetailDto,
  ) {
    return this.projectsService.updateProjectDetail(
      id,
      detailId,
      updateProjectDetailDto,
    );
  }

  // Delete a project detail
  @Delete(':id/details/:detailId')
  async deleteProjectDetail(
    @Param('id') id: string,
    @Param('detailId') detailId: string,
  ) {
    return this.projectsService.deleteProjectDetail(id, detailId);
  }

  // Block and Wing management endpoints

  // Add a block
  @Post(':id/blocks')
  async addBlock(
    @Param('id') id: string,
    @Body() block: { block: string; wings?: string[] },
  ) {
    return this.projectsService.addBlock(id, block);
  }

  // Add a wing to an existing block
  @Post(':id/blocks/:blockId/wings')
  async addWingToBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @Body('name') wingName: string,
  ) {
    return this.projectsService.addWingToBlock(id, blockId, wingName);
  }

  // Cluster and Unit management endpoints

  // Add a cluster
  @Post(':id/clusters')
  async addCluster(
    @Param('id') id: string,
    @Body() cluster: { cluster: string; units?: string[] },
  ) {
    return this.projectsService.addCluster(id, cluster);
  }

  // Add a unit to an existing cluster
  @Post(':id/clusters/:clusterId/units')
  async addUnitToCluster(
    @Param('id') id: string,
    @Param('clusterId') clusterId: string,
    @Body('name') unitName: string,
  ) {
    return this.projectsService.addUnitToCluster(id, clusterId, unitName);
  }

  // Helper endpoints for structure information

  // Get project structure (blocks, wings, clusters, units)
  @Get(':id/structure')
  async getProjectStructure(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    return {
      blocks: project.blockWings || [],
      clusters: project.clusterUnits || [],
    };
  }
  @Post(':id/test-properties')
  async testAddProperties(@Param('id') id: string, @Body() body: any) {
    try {
      // Find the project directly with Mongoose
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Create a new project detail with properties
      const newDetail = {
        _id: new mongoose.Types.ObjectId(),
        isGlobal: true,
        properties: body.properties || [
          { key: 'Test1', value: 1 },
          { key: 'Test2', value: 2 },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // If projectDetails doesn't exist, initialize it
      if (!project.projectDetails) {
        project.projectDetails = [];
      }

      // Push the new detail directly
      project.projectDetails.push(newDetail);

      // Save and return
      await project.save();

      return project;
    } catch (error) {
      console.error('Error in test endpoint:', error);
      throw new InternalServerErrorException('Test failed: ' + error.message);
    }
  }
  @Post(':id/floor-data')
  async updateFloorData(@Param('id') id: string, @Body() floorData: any) {
    return this.projectsService.updateFloorData(id, floorData);
  }
}
