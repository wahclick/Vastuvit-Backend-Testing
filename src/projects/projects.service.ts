// project.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/projects.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel('Project') private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    try {
      // Generate project code if not provided
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
}
