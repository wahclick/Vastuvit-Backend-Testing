// tasks.service.ts - UPDATED to manually fetch rankId without schema changes
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/tasks.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel('Task') private taskModel: Model<TaskDocument>,
    @InjectModel('Crew') private crewModel: Model<any>,
    @InjectModel('Manager') private managerModel: Model<any>,
    @InjectModel('Rank') private rankModel: Model<any>, // Add rank model
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      // If assignedBy is not provided, default to userId (the creator)
      if (!createTaskDto.assignedBy) {
        createTaskDto.assignedBy = createTaskDto.userId;
        createTaskDto.assignedByModel = 'Manager'; // Default to Manager
      }

      // If assignedByModel is not provided, determine it
      if (!createTaskDto.assignedByModel && createTaskDto.assignedBy) {
        const assignedByModel = await this.determineAssignedByModel(createTaskDto.assignedBy);
        createTaskDto.assignedByModel = assignedByModel;
      }

      const createdTask = new this.taskModel(createTaskDto);
      return await createdTask.save();
    } catch (error) {
      console.error('Error creating task:', error);
      throw new InternalServerErrorException(
        'Failed to create task: ' + error.message,
      );
    }
  }

  // Helper method to determine if assignedBy is a Manager or Crew
  private async determineAssignedByModel(assignedById: string): Promise<string> {
    try {
      // First check if it's a manager
      const manager = await this.managerModel.findById(assignedById);
      if (manager) {
        return 'Manager';
      }

      // Then check if it's a crew member
      const crew = await this.crewModel.findById(assignedById);
      if (crew) {
        return 'Crew';
      }

      // Default to Manager if not found (shouldn't happen in normal cases)
      return 'Manager';
    } catch (error) {
      console.error('Error determining assigned by model:', error);
      return 'Manager'; // Default fallback
    }
  }

  // Helper method to enrich user with rank data
  private async enrichUserWithRank(user: any): Promise<any> {
    if (!user) return user;
    
    try {
      // If user has rankId, fetch the rank details
      if (user.rankId) {
        const rank = await this.rankModel.findById(user.rankId).select('name').exec();
        if (rank) {
          return {
            ...user.toObject(),
            rankId: {
              _id: rank._id,
              name: rank.name
            }
          };
        }
      }
      
      // Return user as-is if no rankId or rank not found
      return user.toObject ? user.toObject() : user;
    } catch (error) {
      console.error('Error enriching user with rank:', error);
      return user.toObject ? user.toObject() : user;
    }
  }

  async findAll(firmId: Types.ObjectId | string): Promise<Task[]> {
    try {
      const tasks = await this.taskModel
        .find({ firmId })
        .populate('userId', 'name email') // Manager who created
        .populate('projectId', 'name')
        .populate('assignTo', 'name email') // Crew assigned to
        .populate('taskCheckBy', 'name email') // Crew who checked
        .exec();

      // Manually populate assignedBy based on assignedByModel - INCLUDE RANKID
      for (const task of tasks) {
        if (task.assignedBy && task.assignedByModel) {
          if (task.assignedByModel === 'Manager') {
            const manager = await this.managerModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(manager);
          } else if (task.assignedByModel === 'Crew') {
            const crew = await this.crewModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(crew);
          }
        }
      }

      return tasks;
    } catch (error) {
      console.error('Error finding tasks:', error);
      throw new InternalServerErrorException(
        'Failed to find tasks: ' + error.message,
      );
    }
  }
  
  async findOne(id: string): Promise<Task> {
    try {
      const task = await this.taskModel
        .findById(id)
        .populate('userId', 'name email') // Manager who created
        .populate('firmId', 'name')
        .populate('projectId', 'name')
        .populate('assignTo', 'name email') // Crew assigned to
        .populate('taskCheckBy', 'name email') // Crew who checked
        .exec();
  
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Manually populate assignedBy based on assignedByModel - INCLUDE RANKID
      if (task.assignedBy && task.assignedByModel) {
        if (task.assignedByModel === 'Manager') {
          const manager = await this.managerModel
            .findById(task.assignedBy)
            .select('name email rankId')
            .exec();
          (task as any).assignedBy = await this.enrichUserWithRank(manager);
        } else if (task.assignedByModel === 'Crew') {
          const crew = await this.crewModel
            .findById(task.assignedBy)
            .select('name email rankId')
            .exec();
          (task as any).assignedBy = await this.enrichUserWithRank(crew);
        }
      }
  
      return task;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding task:', error);
      throw new InternalServerErrorException(
        'Failed to find task: ' + error.message,
      );
    }
  }
  
  async findByProject(projectId: Types.ObjectId | string): Promise<Task[]> {
    try {
      const tasks = await this.taskModel
        .find({ projectId })
        .populate('userId', 'name email') // Manager who created
        .populate('assignTo', 'name email') // Crew assigned to
        .populate('taskCheckBy', 'name email') // Crew who checked
        .exec();

      // Manually populate assignedBy based on assignedByModel - INCLUDE RANKID
      for (const task of tasks) {
        if (task.assignedBy && task.assignedByModel) {
          if (task.assignedByModel === 'Manager') {
            const manager = await this.managerModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(manager);
          } else if (task.assignedByModel === 'Crew') {
            const crew = await this.crewModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(crew);
          }
        }
      }

      return tasks;
    } catch (error) {
      console.error('Error finding tasks by project:', error);
      throw new InternalServerErrorException(
        'Failed to find tasks by project: ' + error.message,
      );
    }
  }
  
  async findByAssignee(assignTo: Types.ObjectId | string): Promise<Task[]> {
    try {
      const tasks = await this.taskModel
        .find({ assignTo })
        .populate('userId', 'name email') // Manager who created
        .populate('projectId', 'name')
        .populate('taskCheckBy', 'name email') // Crew who checked
        .exec();

      // Manually populate assignedBy based on assignedByModel - INCLUDE RANKID
      for (const task of tasks) {
        if (task.assignedBy && task.assignedByModel) {
          if (task.assignedByModel === 'Manager') {
            const manager = await this.managerModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(manager);
          } else if (task.assignedByModel === 'Crew') {
            const crew = await this.crewModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(crew);
          }
        }
      }

      return tasks;
    } catch (error) {
      console.error('Error finding tasks by assignee:', error);
      throw new InternalServerErrorException(
        'Failed to find tasks by assignee: ' + error.message,
      );
    }
  }
  
  async findPendingReviewTasks(
    firmId: string,
    status: string,
    remarkStatus: string,
  ) {
    try {
      console.log('Params:', { firmId, status, remarkStatus });
  
      const tasks = await this.taskModel
        .find({
          firmId: new Types.ObjectId(firmId),
          status: status, // 'complete'
          remarkStatus: remarkStatus, // 'pending'
        })
        .populate('assignTo', 'name email') // Crew assigned to
        .populate('userId', 'name email') // Manager who created
        .populate('projectId', 'name')
        .sort({
          priority: 1, // Critical first
          updatedAt: -1, // Recent first
        })
        .exec();

      // Manually populate assignedBy based on assignedByModel - INCLUDE RANKID
      for (const task of tasks) {
        if (task.assignedBy && task.assignedByModel) {
          if (task.assignedByModel === 'Manager') {
            const manager = await this.managerModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(manager);
          } else if (task.assignedByModel === 'Crew') {
            const crew = await this.crewModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(crew);
          }
        }
      }
  
      console.log(`Found ${tasks.length} pending review tasks`);
      return tasks;
    } catch (error) {
      console.error('Error in findPendingReviewTasks:', error);
      throw new Error(`Failed to fetch pending review tasks: ${error.message}`);
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      // If updating assignedBy, also update assignedByModel if not provided
      if (updateTaskDto.assignedBy && !updateTaskDto.assignedByModel) {
        updateTaskDto.assignedByModel = await this.determineAssignedByModel(updateTaskDto.assignedBy);
      }

      const updatedTask = await this.taskModel
        .findByIdAndUpdate(id, updateTaskDto, { new: true })
        .populate('userId', 'name email') // Manager who created
        .populate('firmId', 'name')
        .populate('projectId', 'name')
        .populate('assignTo', 'name email') // Crew assigned to
        .populate('taskCheckBy', 'name email') // Crew who checked
        .exec();
  
      if (!updatedTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Manually populate assignedBy based on assignedByModel - INCLUDE RANKID
      if (updatedTask.assignedBy && updatedTask.assignedByModel) {
        if (updatedTask.assignedByModel === 'Manager') {
          const manager = await this.managerModel
            .findById(updatedTask.assignedBy)
            .select('name email rankId')
            .exec();
          (updatedTask as any).assignedBy = await this.enrichUserWithRank(manager);
        } else if (updatedTask.assignedByModel === 'Crew') {
          const crew = await this.crewModel
            .findById(updatedTask.assignedBy)
            .select('name email rankId')
            .exec();
          (updatedTask as any).assignedBy = await this.enrichUserWithRank(crew);
        }
      }
  
      return updatedTask;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating task:', error);
      throw new InternalServerErrorException(
        'Failed to update task: ' + error.message,
      );
    }
  }
  
  async remove(id: string): Promise<void> {
    try {
      const result = await this.taskModel.findByIdAndDelete(id).exec();
  
      if (!result) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error removing task:', error);
      throw new InternalServerErrorException(
        'Failed to remove task: ' + error.message,
      );
    }
  }
  
  async updateStatus(id: string, status: string): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
  
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
  
      task.status = status;
      return task.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating task status:', error);
      throw new InternalServerErrorException(
        'Failed to update task status: ' + error.message,
      );
    }
  }
  
  async updateRemarkStatus(
    id: string,
    remarkStatus: string,
    taskCheckBy: Types.ObjectId,
  ): Promise<Task> {
    try {
      const task = await this.taskModel.findById(id);
  
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
  
      task.remarkStatus = remarkStatus;
      task.taskCheckBy = taskCheckBy;
      return task.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating task remark status:', error);
      throw new InternalServerErrorException(
        'Failed to update task remark status: ' + error.message,
      );
    }
  }
  
  async findByFirmAndAssignee(
    firmId: string,
    assigneeId: string,
    status?: string,
  ) {
    try {
      const query: any = {
        firmId: new Types.ObjectId(firmId),
        assignTo: new Types.ObjectId(assigneeId),
      };
  
      if (status) {
        query.status = status;
      }
  
      const tasks = await this.taskModel
        .find(query)
        .populate('userId', 'name email') // Manager who created
        .populate('assignTo', 'name email') // Crew assigned to
        .populate('taskCheckBy', 'name email') // Crew who checked
        .exec();

      // Manually populate assignedBy based on assignedByModel - INCLUDE RANKID
      for (const task of tasks) {
        if (task.assignedBy && task.assignedByModel) {
          if (task.assignedByModel === 'Manager') {
            const manager = await this.managerModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(manager);
          } else if (task.assignedByModel === 'Crew') {
            const crew = await this.crewModel
              .findById(task.assignedBy)
              .select('name email rankId')
              .exec();
            (task as any).assignedBy = await this.enrichUserWithRank(crew);
          }
        }
      }
  
      return tasks;
    } catch (error) {
      console.error('Error finding tasks by firm and assignee:', error);
      throw new Error(`Failed to find tasks: ${error.message}`);
    }
  }
  async findByProjectAndCrew(projectId: string, crewId: string) {
    try {
      const projectObjectId = new Types.ObjectId(projectId);
      const crewObjectId = new Types.ObjectId(crewId);
      
      const tasks = await this.taskModel.find({
        projectId: projectObjectId,
        assignTo: crewObjectId,  // This matches your schema
      }).exec();
      
      console.log(`Found ${tasks.length} tasks for project ${projectId} and crew ${crewId}`);
      return tasks;
    } catch (error) {
      console.error('Error in findByProjectAndCrew:', error);
      return [];
    }
  }
  
  async findByFirmAndAssigner(firmId: string, assignerId: string, status?: string) {
    const query: any = {
      firmId: new Types.ObjectId(firmId),
      assignedBy: new Types.ObjectId(assignerId)
    };
    
    if (status) {
      query.status = status;
    }
  
    return this.taskModel.find(query)
      .populate('assignTo', 'name')
      .populate('assignedBy', 'name')
      .populate('projectId', 'name code')
      .populate('userId', 'name')
      .exec();
  }
  async getDrawingDataForProject(projectId: string): Promise<any> {
    try {
      console.log('Getting drawing data for project:', projectId);
      
      // Find tasks that are completed and approved for the project
      const tasks = await this.taskModel
        .find({
          projectId: new Types.ObjectId(projectId),
          status: 'completed',
          remarkStatus: 'approved'
        })
        .exec();
  
      console.log(`Found ${tasks.length} completed/approved tasks`);
  
      if (!tasks || tasks.length === 0) {
        return {
          drawingTypes: ['Other'],
          drawingNumbers: ['Other']
        };
      }
  
      let drawingTypes = new Set();
      let drawingNumbers = new Set();
  
      tasks.forEach(task => {
        console.log('Processing task metadata:', task.metadata);
        
        if (task.metadata) {
          try {
            // Parse the metadata JSON string
            const metadata = JSON.parse(task.metadata);
            console.log('Parsed metadata:', metadata);
            
            // Extract drawing type/category
            if (metadata.drawingCategory) {
              drawingTypes.add(metadata.drawingCategory);
            }
            if (metadata.type) {
              drawingTypes.add(metadata.type);
            }
            
            // Extract drawing number
            if (metadata.drawingNumber && metadata.drawingNumber !== "NA") {
              drawingNumbers.add(metadata.drawingNumber);
            }
            if (metadata.drawno && metadata.drawno !== "NA") {
              drawingNumbers.add(metadata.drawno);
            }
            
          } catch (parseError) {
            console.warn('Error parsing metadata for task:', task._id, parseError);
          }
        }
      });
  
      const result = {
        drawingTypes: [...Array.from(drawingTypes), 'Other'],
        drawingNumbers: [...Array.from(drawingNumbers), 'Other']
      };
  
      console.log('Final result:', result);
      return result;
  
    } catch (error) {
      console.error('Error getting drawing data for project:', error);
      throw new InternalServerErrorException(
        'Failed to get drawing data: ' + error.message,
      );
    }
  }
}