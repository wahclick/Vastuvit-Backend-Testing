import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Print } from './schema/print.schema';
import { CreatePrintDto } from './dto/create-print.dto';
import { UpdatePrintDto } from './dto/update-print.dto';
import { PopulatedPrintDto } from './dto/populated-print.dto';

@Injectable()
export class PrintService {
  constructor(
    @InjectModel(Print.name) private printModel: Model<Print>,
    @InjectModel('Manager') private managerModel: Model<any>,
    @InjectModel('Crew') private crewModel: Model<any>,
    @InjectModel('Project') private projectModel: Model<any>,
  ) {}

  async create(createPrintDto: CreatePrintDto): Promise<Print> {
    const print = new this.printModel(createPrintDto);
    return print.save();
  }

  async findAll(): Promise<PopulatedPrintDto[]> {
    const prints = await this.printModel.find().exec();
    return this.populateUserAndProjectNames(prints);
  }

  async findOne(id: string): Promise<PopulatedPrintDto> {
    const print = await this.printModel.findById(id).exec();
    if (!print) {
      throw new NotFoundException(`Print with ID ${id} not found`);
    }
    const populatedPrints = await this.populateUserAndProjectNames([print]);
    return populatedPrints[0];
  }

  async findByProject(projectId: string): Promise<PopulatedPrintDto[]> {
    const prints = await this.printModel.find({ project_id: projectId }).exec();
    return this.populateUserAndProjectNames(prints);
  }

  async findGeneralPrints(firmId: string): Promise<PopulatedPrintDto[]> {
    const prints = await this.printModel.find({ 
      project_id: null
    }).exec();
    
    return this.populateUserAndProjectNames(prints);
  }

  private async populateUserAndProjectNames(prints: Print[]): Promise<PopulatedPrintDto[]> {
    const populatedPrints: PopulatedPrintDto[] = [];

    for (const print of prints) {
      let submittedByName = 'Unknown';
      let projectName = 'General';

      // Search for user in both Manager and Crew collections
      try {
        const manager = await this.managerModel.findById(print.submitted_by).exec();
        if (manager) {
          submittedByName = manager.name;
        } else {
          const crew = await this.crewModel.findById(print.submitted_by).exec();
          if (crew) {
            submittedByName = crew.name;
          }
        }
      } catch (error) {
        console.error('Error finding user:', error);
      }

      // Get project name if project_id exists
      if (print.project_id) {
        try {
          const project = await this.projectModel.findById(print.project_id).exec();
          if (project) {
            projectName = project.name;
          }
        } catch (error) {
          console.error('Error finding project:', error);
        }
      }

      const printObj = print.toObject();
      populatedPrints.push({
        _id: printObj._id.toString(),
        project_id: printObj.project_id?.toString(),
        type: printObj.type,
        size: printObj.size,
        number_of_prints: printObj.number_of_prints,
        remarks: printObj.remarks,
        submitted_by: printObj.submitted_by.toString(),
        date: printObj.date,
        cost: printObj.cost,
        amount: printObj.amount,
        expense_head: printObj.expense_head,
        expense_type: printObj.expense_type,
        submitted_by_name: submittedByName,
        project_name: projectName,
        createdAt: printObj.createdAt,
        updatedAt: printObj.updatedAt
      });
    }

    return populatedPrints;
  }

  async update(id: string, updatePrintDto: UpdatePrintDto): Promise<PopulatedPrintDto> {
    const print = await this.printModel.findByIdAndUpdate(id, updatePrintDto, { new: true }).exec();
    if (!print) {
      throw new NotFoundException(`Print with ID ${id} not found`);
    }
    const populatedPrints = await this.populateUserAndProjectNames([print]);
    return populatedPrints[0];
  }

  async remove(id: string): Promise<void> {
    const result = await this.printModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Print with ID ${id} not found`);
    }
  }

  async submitPrintJobs(printJobs: CreatePrintDto[], userId: string): Promise<{ success: boolean; message: string }> {
    if (printJobs.length === 0) {
      throw new BadRequestException("Please add at least one print job.");
    }

    try {
      const currentDate = new Date();

      for (const job of printJobs) {
        if (!job.project_id || job.project_id === 'general') {
          const generalPrintData = {
            type: job.type,
            size: job.size,
            number_of_prints: job.number_of_prints,
            remarks: job.remarks,
            submitted_by: userId,
            date: currentDate,
            cost: job.cost,
            amount: job.cost ? job.cost * job.number_of_prints : 0,
            expense_head: "Office Expenses",
            expense_type: "Any Other Office Expense",
          };

          const print = new this.printModel(generalPrintData);
          await print.save();
        } else {
          const projectPrintData = {
            project_id: job.project_id,
            type: job.type,
            size: job.size,
            number_of_prints: job.number_of_prints,
            remarks: job.remarks,
            submitted_by: userId,
            date: currentDate,
            cost: job.cost,
            amount: job.cost ? job.cost * job.number_of_prints : 0,
          };

          const print = new this.printModel(projectPrintData);
          await print.save();
        }
      }

      return {
        success: true,
        message: "Print jobs uploaded successfully."
      };

    } catch (error) {
      console.error("Error uploading print jobs:", error);
      throw new InternalServerErrorException("An error occurred while uploading print jobs. Please try again.");
    }
  }
  
}