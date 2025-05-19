// tasks.service.ts
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
  constructor(@InjectModel('Task') private taskModel: Model<TaskDocument>) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      const createdTask = new this.taskModel(createTaskDto);
      return await createdTask.save();
    } catch (error) {
      console.error('Error creating task:', error);
      throw new InternalServerErrorException(
        'Failed to create task: ' + error.message,
      );
    }
  }

  async findAll(firmId: Types.ObjectId | string): Promise<Task[]> {
    try {
      return this.taskModel
        .find({ firmId })
        .populate('userId', 'name')
        .populate('projectId', 'name')
        .populate('assignTo', 'name')
        .populate('taskCheckBy', 'name')
        .exec();
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
        .populate('userId', 'name')
        .populate('firmId', 'name')
        .populate('projectId', 'name')
        .populate('assignTo', 'name')
        .populate('taskCheckBy', 'name')
        .exec();

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
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

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    try {
      const updatedTask = await this.taskModel
        .findByIdAndUpdate(id, updateTaskDto, { new: true })
        .exec();

      if (!updatedTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
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

  async findByProject(projectId: Types.ObjectId | string): Promise<Task[]> {
    try {
      return this.taskModel
        .find({ projectId })
        .populate('userId', 'name')
        .populate('assignTo', 'name')
        .populate('taskCheckBy', 'name')
        .exec();
    } catch (error) {
      console.error('Error finding tasks by project:', error);
      throw new InternalServerErrorException(
        'Failed to find tasks by project: ' + error.message,
      );
    }
  }

  async findByAssignee(assignTo: Types.ObjectId | string): Promise<Task[]> {
    try {
      return this.taskModel
        .find({ assignTo })
        .populate('userId', 'name')
        .populate('projectId', 'name')
        .populate('taskCheckBy', 'name')
        .exec();
    } catch (error) {
      console.error('Error finding tasks by assignee:', error);
      throw new InternalServerErrorException(
        'Failed to find tasks by assignee: ' + error.message,
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
    firmId: Types.ObjectId | string,
    assignTo: Types.ObjectId | string
  ): Promise<Task[]> {
    try {
      return this.taskModel
        .find({ 
          firmId: new Types.ObjectId(firmId), 
          assignTo: new Types.ObjectId(assignTo) 
        })
        .populate('userId', 'name email')
        .populate('projectId', 'name code')
        .populate('assignTo', 'name email')
        .populate('taskCheckBy', 'name email')
        .exec();
    } catch (error) {
      console.error('Error finding tasks by firm and assignee:', error);
      throw new InternalServerErrorException(
        'Failed to find tasks by firm and assignee: ' + error.message,
      );
    }
  }
}
