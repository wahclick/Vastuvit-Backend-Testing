// project.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import {
  Project,
  ProjectDetails,
  ProjectDocument,
} from './schemas/projects.schema';
import { CreateProjectDto } from './dto/projects/create-project.dto';
import { UpdateProjectDto } from './dto/projects/update-project.dto';
import { CreateProjectDetailDto } from './dto/projectsDetails/project-details.dto';
import { QueryProjectDetailDto } from './dto/projectsDetails/query-project.dto';
import { UpdateProjectDetailDto } from './dto/projectsDetails/update-project-detail.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('Project') private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      // Generate project code if not provided
      console.log(createProjectDto);
      if (!createProjectDto.projectCode) {
        createProjectDto.projectCode = await this.generateProjectCode(
          createProjectDto.firmId.toString(),
          createProjectDto.projectCategory,
        );
      } else {
        // Check if project code already exists
        const existingProject = await this.projectModel.findOne({
          projectCode: createProjectDto.projectCode,
        });

        if (existingProject) {
          throw new ConflictException(
            `Project with code ${createProjectDto.projectCode} already exists`,
          );
        }
      }

      const createdProject = new this.projectModel(createProjectDto);
      return await createdProject.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Error creating project:', error);
      throw new InternalServerErrorException(
        'Failed to create project: ' + error.message,
      );
    }
  }

  async findAll(firmId: Types.ObjectId | string): Promise<Project[]> {
    try {
      return this.projectModel
        .find({ firmId })
        .populate('userId')
        .populate('clientId')
        .exec();
    } catch (error) {
      console.error('Error finding projects:', error);
      throw new InternalServerErrorException(
        'Failed to find projects: ' + error.message,
      );
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.projectModel
        .findById(id)
        .populate('userId')
        .populate('clientId')
        .populate('firmId')
        .exec();

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding project:', error);
      throw new InternalServerErrorException(
        'Failed to find project: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<Project> {
    try {
      // Check if trying to update project code and it already exists
      if (updateProjectDto.projectCode) {
        const existingProject = await this.projectModel.findOne({
          projectCode: updateProjectDto.projectCode,
          _id: { $ne: id },
        });

        if (existingProject) {
          throw new ConflictException(
            `Project with code ${updateProjectDto.projectCode} already exists`,
          );
        }
      }

      const updatedProject = await this.projectModel
        .findByIdAndUpdate(id, updateProjectDto, { new: true })
        .exec();

      if (!updatedProject) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      return updatedProject;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error updating project:', error);
      throw new InternalServerErrorException(
        'Failed to update project: ' + error.message,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.projectModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing project:', error);
      throw new InternalServerErrorException(
        'Failed to remove project: ' + error.message,
      );
    }
  }

  async findByClient(clientId: Types.ObjectId | string): Promise<Project[]> {
    try {
      return this.projectModel.find({ clientId }).exec();
    } catch (error) {
      console.error('Error finding projects by client:', error);
      throw new InternalServerErrorException(
        'Failed to find projects by client: ' + error.message,
      );
    }
  }

  async findByManager(userId: Types.ObjectId | string): Promise<Project[]> {
    try {
      return this.projectModel.find({ userId }).populate('clientId').exec();
    } catch (error) {
      console.error('Error finding projects by manager:', error);
      throw new InternalServerErrorException(
        'Failed to find projects by manager: ' + error.message,
      );
    }
  }

  async toggleEnabled(id: string): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      project.isEnabled = !project.isEnabled;
      return project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error toggling project status:', error);
      throw new InternalServerErrorException(
        'Failed to toggle project status: ' + error.message,
      );
    }
  }

  async addSiteVisit(id: string, siteVisit: any): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      if (!project.siteVisits) {
        project.siteVisits = [];
      }

      project.siteVisits.push(siteVisit);
      return project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding site visit:', error);
      throw new InternalServerErrorException(
        'Failed to add site visit: ' + error.message,
      );
    }
  }

  async addBillingStage(id: string, billingStage: any): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      if (!project.billingStages) {
        project.billingStages = [];
      }

      project.billingStages.push(billingStage);
      return project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding billing stage:', error);
      throw new InternalServerErrorException(
        'Failed to add billing stage: ' + error.message,
      );
    }
  }

  private async generateProjectCode(
    firmId: string,
    category: string,
  ): Promise<string> {
    try {
      // Get count of existing projects for this firm and category
      const count = await this.projectModel.countDocuments({
        firmId,
        projectCategory: category,
      });

      // Generate code with format: CATEGORY-FIRMID-COUNT
      // Take first 3 chars of category and last 4 of firmId
      const categoryPrefix = category.substring(0, 3).toUpperCase();
      const firmIdSuffix = firmId.substring(firmId.length - 4);
      const countPadded = String(count + 1).padStart(3, '0');

      return `${categoryPrefix}-${firmIdSuffix}-${countPadded}`;
    } catch (error) {
      console.error('Error generating project code:', error);
      throw new InternalServerErrorException(
        'Failed to generate project code: ' + error.message,
      );
    }
  }
  async addProjectDetail(
    projectId: string,
    detailDto: CreateProjectDetailDto,
  ): Promise<Project> {
    try {
      console.log('Adding project detail with DTO:', JSON.stringify(detailDto));

      const project = await this.projectModel.findById(projectId);

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Always use the first global detail or create one if none exists
      let detail: any = null;
      let detailIndex = -1;

      if (project.projectDetails && project.projectDetails.length > 0) {
        detailIndex = project.projectDetails.findIndex(
          (d) => d.isGlobal === true,
        );
        if (detailIndex !== -1) {
          detail = project.projectDetails[detailIndex];
        }
      }

      if (!detail) {
        // Create new global detail with properties directly from DTO
        detail = {
          _id: new mongoose.Types.ObjectId(),
          isGlobal: true,
          properties: detailDto.properties || [], // Directly use properties from DTO
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add to project
        if (!project.projectDetails) {
          project.projectDetails = [];
        }

        project.projectDetails.push(detail);
      } else {
        // Update existing detail

        // Ensure properties array exists
        if (!detail.properties) {
          detail.properties = [];
        }

        // Update or add properties from DTO
        if (detailDto.properties && detailDto.properties.length > 0) {
          detailDto.properties.forEach((prop) => {
            const existingPropIndex = detail.properties.findIndex(
              (p) => p.key === prop.key,
            );

            if (existingPropIndex !== -1) {
              detail.properties[existingPropIndex].value = prop.value;
            } else {
              detail.properties.push({
                key: prop.key,
                value: prop.value,
              });
            }
          });
        }

        // Update timestamp
        detail.updatedAt = new Date();

        // Update in project
        project.projectDetails[detailIndex] = detail;
      }

      // Save and return project
      const savedProject = await project.save();

      return savedProject;
    } catch (error) {
      console.error('Error in addProjectDetail:', error);
      throw new InternalServerErrorException('Failed: ' + error.message);
    }
  }
  // Fix the getProjectDetails method
  async getProjectDetails(
    projectId: string,
    queryDto: QueryProjectDetailDto,
  ): Promise<any> {
    try {
      console.log('Query parameters:', queryDto); // Log incoming parameters

      const project = await this.projectModel.findById(projectId);

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      if (!project.projectDetails || project.projectDetails.length === 0) {
        console.log('No project details found');
        return [];
      }

      console.log(`Found ${project.projectDetails.length} project details`);

      // Deep clone the details to avoid modifying the original
      let filteredDetails = JSON.parse(JSON.stringify(project.projectDetails));

      // Debug: log the first detail to see its structure
      if (filteredDetails.length > 0) {
        console.log(
          'First detail sample:',
          JSON.stringify(filteredDetails[0]).substring(0, 200),
        );
      }

      // If isGlobal parameter is provided
      if (queryDto.isGlobal !== undefined) {
        const isGlobalParam = queryDto.isGlobal;
        console.log(
          'isGlobal parameter value and type:',
          isGlobalParam,
          typeof isGlobalParam,
        );

        // Convert parameter to boolean, handling various formats
        let isGlobalBool: boolean;

        if (typeof isGlobalParam === 'string') {
          // Convert string to lowercase for case-insensitive comparison
          const lowerParam = isGlobalParam.toLowerCase();
          isGlobalBool =
            lowerParam === 'true' || lowerParam === '1' || lowerParam === 'yes';
        } else {
          isGlobalBool = !!isGlobalParam; // Convert to boolean
        }

        console.log('Converted isGlobal to boolean:', isGlobalBool);

        // More flexible comparison for isGlobal
        filteredDetails = filteredDetails.filter((detail) => {
          // Handle various formats of isGlobal in the detail
          let detailIsGlobal: boolean;

          if (typeof detail.isGlobal === 'string') {
            const lowerDetail = String(detail.isGlobal).toLowerCase();
            // Handle case where isGlobal might be "**true**" or similar
            detailIsGlobal =
              lowerDetail === 'true' ||
              lowerDetail === '1' ||
              lowerDetail === 'yes' ||
              lowerDetail.includes('true');
          } else {
            detailIsGlobal = !!detail.isGlobal;
          }

          console.log(
            `Detail ${detail._id}: isGlobal=${detail.isGlobal}, converted=${detailIsGlobal}`,
          );
          return detailIsGlobal === isGlobalBool;
        });
      }

      // Apply other filters with proper null checks
      if (queryDto.blockId) {
        filteredDetails = filteredDetails.filter(
          (detail) =>
            detail.blockId &&
            queryDto.blockId && // Add null check
            detail.blockId.toString() === queryDto.blockId.toString(),
        );
      }

      if (queryDto.wingId) {
        filteredDetails = filteredDetails.filter(
          (detail) =>
            detail.wingId &&
            queryDto.wingId && // Add null check
            detail.wingId.toString() === queryDto.wingId.toString(),
        );
      }

      if (queryDto.clusterId) {
        filteredDetails = filteredDetails.filter(
          (detail) =>
            detail.clusterId &&
            queryDto.clusterId && // Add null check
            detail.clusterId.toString() === queryDto.clusterId.toString(),
        );
      }

      if (queryDto.unitId) {
        filteredDetails = filteredDetails.filter(
          (detail) =>
            detail.unitId &&
            queryDto.unitId && // Add null check
            detail.unitId.toString() === queryDto.unitId.toString(),
        );
      }

      console.log(`Returning ${filteredDetails.length} filtered details`);
      return filteredDetails;
    } catch (error) {
      console.error('Error in getProjectDetails:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get project details: ' + error.message,
      );
    }
  }

  // Fix the validateStructureReferences method
  private async validateStructureReferences(
    project: Project,
    detail: any,
  ): Promise<void> {
    // If block is specified, ensure it exists
    if (detail.blockId) {
      const blockExists = project.blockWings?.some(
        (block) =>
          block._id && block._id.toString() === detail.blockId.toString(),
      );

      if (!blockExists) {
        throw new NotFoundException(
          `Block with ID ${detail.blockId} not found in project`,
        );
      }

      // If wing is also specified, ensure it belongs to the specified block
      if (detail.wingId) {
        const block = project.blockWings?.find(
          (b) => b._id && b._id.toString() === detail.blockId.toString(),
        );

        if (!block || !block.wings) {
          throw new NotFoundException(
            `Block with ID ${detail.blockId} not found or has no wings`,
          );
        }

        // Check if wing exists in the block
        const wingExists = block.wings.some(
          (wing) =>
            typeof wing === 'object' &&
            wing._id &&
            wing._id.toString() === detail.wingId.toString(),
        );

        if (!wingExists) {
          throw new NotFoundException(
            `Wing with ID ${detail.wingId} not found in block ${detail.blockId}`,
          );
        }
      }
    } else if (detail.wingId) {
      // If only wing is specified without a block, reject
      throw new BadRequestException('Wing cannot be specified without a block');
    }

    // Similar validation for cluster and unit
    if (detail.clusterId) {
      const clusterExists = project.clusterUnits?.some(
        (cluster) =>
          cluster._id && cluster._id.toString() === detail.clusterId.toString(),
      );

      if (!clusterExists) {
        throw new NotFoundException(
          `Cluster with ID ${detail.clusterId} not found in project`,
        );
      }

      // If unit is also specified, ensure it belongs to the specified cluster
      if (detail.unitId) {
        const cluster = project.clusterUnits?.find(
          (c) => c._id && c._id.toString() === detail.clusterId.toString(),
        );

        if (!cluster || !cluster.units) {
          throw new NotFoundException(
            `Cluster with ID ${detail.clusterId} not found or has no units`,
          );
        }

        // Check if unit exists in the cluster
        const unitExists = cluster.units.some(
          (unit) =>
            typeof unit === 'object' &&
            unit._id &&
            unit._id.toString() === detail.unitId.toString(),
        );

        if (!unitExists) {
          throw new NotFoundException(
            `Unit with ID ${detail.unitId} not found in cluster ${detail.clusterId}`,
          );
        }
      }
    } else if (detail.unitId) {
      // If only unit is specified without a cluster, reject
      throw new BadRequestException(
        'Unit cannot be specified without a cluster',
      );
    }
  }
  // Add this to your ProjectsService
  async updateProjectDetail(
    projectId: string,
    detailId: string,
    updateDto: UpdateProjectDetailDto,
  ): Promise<Project> {
    try {
      const project = await this.projectModel.findById(projectId);

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Find the detail to update
      const detailIndex = project.projectDetails?.findIndex(
        (detail) => detail._id.toString() === detailId,
      );

      if (detailIndex === -1 || detailIndex === undefined) {
        throw new NotFoundException(
          `Project detail with ID ${detailId} not found`,
        );
      }

      // If changing references (block, wing, cluster, unit), validate them
      if (
        updateDto.blockId !== undefined ||
        updateDto.wingId !== undefined ||
        updateDto.clusterId !== undefined ||
        updateDto.unitId !== undefined
      ) {
        await this.validateStructureReferences(project, {
          ...project.projectDetails[detailIndex],
          ...updateDto,
        });
      }

      // Update the detail with type assertion
      project.projectDetails[detailIndex] = {
        ...project.projectDetails[detailIndex],
        ...updateDto,
        updatedAt: new Date(),
      } as any; // Add type assertion here

      // Save the project
      return await project.save();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error updating project detail:', error);
      throw new InternalServerErrorException(
        'Failed to update project detail: ' + error.message,
      );
    }
  }

  async updateFloorData(projectId: string, floorData: any): Promise<Project> {
    try {
      console.log('Updating floor data:', floorData);

      // Get the project
      const project = await this.projectModel.findById(projectId);
      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Convert the floor data to properties
      const properties: any[] = []; // Type as any[] to avoid TypeScript errors
      for (const [key, value] of Object.entries(floorData)) {
        if (value !== undefined && value !== null && value !== '') {
          properties.push({
            key,
            value,
          });
        }
      }

      console.log('Properties to save:', properties);

      // Find global floor detail if it exists
      let floorDetail: any = null; // Type as any to avoid TypeScript errors
      let detailIndex = -1;

      if (project.projectDetails && project.projectDetails.length > 0) {
        for (let i = 0; i < project.projectDetails.length; i++) {
          if (project.projectDetails[i].isGlobal === true) {
            floorDetail = project.projectDetails[i];
            detailIndex = i;
            break;
          }
        }
      }

      console.log('Found floor detail:', floorDetail ? 'Yes' : 'No');

      if (floorDetail) {
        // Update existing floor detail
        floorDetail.properties = properties;
        floorDetail.updatedAt = new Date();

        // Update in the array
        project.projectDetails[detailIndex] = floorDetail;
      } else {
        // Create new floor detail
        const newDetail = {
          _id: new mongoose.Types.ObjectId(),
          isGlobal: true,
          properties: properties,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Initialize projectDetails if it doesn't exist
        if (!project.projectDetails) {
          project.projectDetails = [];
        }

        // Add to the array
        project.projectDetails.push(newDetail as any); // Use type assertion
      }

      // Save and return the project
      await project.save();
      return project;
    } catch (error) {
      console.error('Error updating floor data:', error);
      throw new InternalServerErrorException(
        'Failed to update floor data: ' + error.message,
      );
    }
  }
  // Delete a project detail
  async deleteProjectDetail(
    projectId: string,
    detailId: string,
  ): Promise<Project> {
    try {
      const project = await this.projectModel.findById(projectId);

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found`);
      }

      // Find the detail to delete
      const detailIndex = project.projectDetails?.findIndex(
        (detail) => detail._id.toString() === detailId,
      );

      if (detailIndex === -1 || detailIndex === undefined) {
        throw new NotFoundException(
          `Project detail with ID ${detailId} not found`,
        );
      }

      // Remove the detail
      project.projectDetails.splice(detailIndex, 1);

      // Save the project
      return await project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting project detail:', error);
      throw new InternalServerErrorException(
        'Failed to delete project detail: ' + error.message,
      );
    }
  }

  // Add a block
  async addBlock(
    id: string,
    blockData: { block: string; wings?: string[] },
  ): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      if (!project.blockWings) {
        project.blockWings = [];
      }

      // Create a new block with _id
      const newBlock = {
        _id: new Types.ObjectId(),
        block: blockData.block,
        wings:
          blockData.wings?.map((wingName) => ({
            _id: new Types.ObjectId(),
            name: wingName,
          })) || [],
      };

      // Add the block to the project
      project.blockWings.push(newBlock);
      return await project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding block:', error);
      throw new InternalServerErrorException(
        'Failed to add block: ' + error.message,
      );
    }
  }

  // Add a wing to an existing block
  async addWingToBlock(
    id: string,
    blockId: string,
    wingName: string,
  ): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Find the block
      const blockIndex = project.blockWings?.findIndex(
        (block) => block._id.toString() === blockId,
      );

      if (blockIndex === -1 || blockIndex === undefined) {
        throw new NotFoundException(
          `Block with ID ${blockId} not found in project`,
        );
      }

      if (!project.blockWings[blockIndex].wings) {
        project.blockWings[blockIndex].wings = [];
      }

      // Add the new wing
      project.blockWings[blockIndex].wings.push({
        _id: new Types.ObjectId(),
        name: wingName,
      });

      return await project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding wing to block:', error);
      throw new InternalServerErrorException(
        'Failed to add wing to block: ' + error.message,
      );
    }
  }

  // Add a cluster
  async addCluster(
    id: string,
    clusterData: { cluster: string; units?: string[] },
  ): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      if (!project.clusterUnits) {
        project.clusterUnits = [];
      }

      // Create a new cluster with _id
      const newCluster = {
        _id: new Types.ObjectId(),
        cluster: clusterData.cluster,
        units:
          clusterData.units?.map((unitName) => ({
            _id: new Types.ObjectId(),
            name: unitName,
          })) || [],
      };

      // Add the cluster to the project
      project.clusterUnits.push(newCluster);
      return await project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding cluster:', error);
      throw new InternalServerErrorException(
        'Failed to add cluster: ' + error.message,
      );
    }
  }

  // Add a unit to an existing cluster
  async addUnitToCluster(
    id: string,
    clusterId: string,
    unitName: string,
  ): Promise<Project> {
    try {
      const project = await this.projectModel.findById(id);

      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }

      // Find the cluster
      const clusterIndex = project.clusterUnits?.findIndex(
        (cluster) => cluster._id.toString() === clusterId,
      );

      if (clusterIndex === -1 || clusterIndex === undefined) {
        throw new NotFoundException(
          `Cluster with ID ${clusterId} not found in project`,
        );
      }

      if (!project.clusterUnits[clusterIndex].units) {
        project.clusterUnits[clusterIndex].units = [];
      }

      // Add the new unit
      project.clusterUnits[clusterIndex].units.push({
        _id: new Types.ObjectId(),
        name: unitName,
      });

      return await project.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding unit to cluster:', error);
      throw new InternalServerErrorException(
        'Failed to add unit to cluster: ' + error.message,
      );
    }
  }

  // Replace your findAllWithClientData method with this fixed version:

 
async findAllWithClientData(firmId: Types.ObjectId | string): Promise<any[]> {
  try {
    const projects = await this.projectModel
      .find({ firmId })
      .populate('userId')
      .populate('clientId')
      .lean() // This is crucial - converts to plain JS objects
      .exec();

    return projects.map((project: any) => ({
      id: project._id.toString(),
      client: project.clientId?.name || '',
      label: project.name,
      value: project.name,
      code: project.projectCode || '',
      address: project.address || '',
      projectCategory: project.projectCategory,
      projectType: project.projectType,
      totalBudget: project.totalBudget,
      designFee: project.designFee,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      state: project.state,
      city: project.city,
      country: project.country,
      // Add the measurement fields you need
      plotAreaMeter: project.measurementMetric?.plotArea || 0,
      plotAreaFeet: project.measurementImperial?.plotArea || 0,
      coveredAreaMeter: project.measurementMetric?.builtCovered || 0,
      coveredAreaFeet: project.measurementImperial?.builtCovered || 0,
      plinthAreaMeter: project.measurementMetric?.builtPlinth || 0,
      plinthAreaFeet: project.measurementImperial?.builtPlinth || 0,
      clientData: project.clientId ? {
        id: project.clientId._id?.toString(),
        name: project.clientId.name,
        address: project.clientId.address,
        city: project.clientId.city,
        state: project.clientId.state,
        country: project.clientId.country,
        email: project.clientId.email,
        mobileNumber: project.clientId.mobileNumber,
      } : null,
    }));
  } catch (error) {
    throw new InternalServerErrorException('Failed to find projects: ' + error.message);
  }
}
  async getProjectReferral(projectId: string) {
    const project = await this.projectModel
      .findById(projectId)
      .populate(
        'referralId',
        'fullName email telephone referralAmount referralPercentage',
      )
      .exec();
  
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
  
    return {
      projectId: project._id,
      projectName: project.name,
      referral: project.referralId || null,
    };
  }
  
  async findByReferral(referralId: string) {
    try {
      const projects = await this.projectModel
        .find({
          referralId: new Types.ObjectId(referralId),
          isEnabled: true,
        })
        .populate('clientId', 'name email')
        .populate('referralId', 'fullName referralPercentage')
        .exec();
  
      return projects;
    } catch (error) {
      throw new NotFoundException(
        `No projects found for referral ID ${referralId}`,
      );
    }
  }
}
