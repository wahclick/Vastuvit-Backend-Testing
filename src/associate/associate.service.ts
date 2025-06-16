import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Associate, AssociateDocument, ProjectAssignment } from './schema/associate.schema';
import { CreateAssociateDto } from './dto/create-associate.dto';
import { UpdateAssociateDto } from './dto/update-associate.dto';
import { AssignProjectDto } from './dto/assign-project.dto';

@Injectable()
export class AssociateService {
  constructor(
    @InjectModel(Associate.name) private associateModel: Model<AssociateDocument>,
  ) {}

  async createAssociate(createAssociateDto: CreateAssociateDto): Promise<Associate> {
    const existingAssociate = await this.associateModel.findOne({
      firm_id: createAssociateDto.firm_id,
      $or: [
        { email: createAssociateDto.email },
        { telephone: createAssociateDto.telephone },
      ],
    });

    if (existingAssociate) {
      throw new ConflictException('Associate with this email or phone already exists');
    }

    const associate = new this.associateModel(createAssociateDto);
    return associate.save();
  }

  async findAssociatesByFirm(firmId: string) {
    const associates = await this.associateModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name email')
      .populate('firm_id', 'name')
      .populate('projectAssignments.projectId', 'name description')
      .sort({ createdAt: -1 })
      .exec();

    return associates;
  }

  async findAssociateById(id: string): Promise<Associate> {
    const associate = await this.associateModel
      .findById(id)
      .populate('user_id', 'name email')
      .populate('firm_id', 'name logo address')
      .populate('projectAssignments.projectId', 'name description status')
      .exec();

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    return associate;
  }

  async updateAssociate(id: string, updateAssociateDto: UpdateAssociateDto): Promise<Associate> {
    if (updateAssociateDto.email || updateAssociateDto.telephone) {
      const existingAssociate = await this.associateModel.findOne({
        _id: { $ne: id },
        firm_id: updateAssociateDto.firm_id,
        $or: [
          ...(updateAssociateDto.email ? [{ email: updateAssociateDto.email }] : []),
          ...(updateAssociateDto.telephone ? [{ telephone: updateAssociateDto.telephone }] : []),
        ],
      });

      if (existingAssociate) {
        throw new ConflictException('Associate with this email or phone already exists');
      }
    }

    const associate = await this.associateModel
      .findByIdAndUpdate(id, { $set: updateAssociateDto }, { new: true, runValidators: true })
      .populate('user_id firm_id')
      .exec();

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    return associate;
  }

  async deleteAssociate(id: string): Promise<void> {
    const associate = await this.associateModel.findById(id);

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    await this.associateModel.findByIdAndDelete(id);
  }

  async updateAssociateStatus(id: string, status: string): Promise<Associate> {
    const associate = await this.associateModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    return associate;
  }

  // NEW PROJECT ASSIGNMENT METHODS
  async assignProjectToAssociate(associateId: string, assignProjectDto: AssignProjectDto): Promise<Associate> {
    const associate = await this.associateModel.findById(associateId);
    
    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    // Check if project is already assigned
    const existingAssignment = associate.projectAssignments.find(
      assignment => assignment.projectId.toString() === assignProjectDto.projectId && assignment.isActive
    );

    if (existingAssignment) {
      throw new ConflictException('Project is already assigned to this associate');
    }

    const newAssignment: ProjectAssignment = {
      projectId: new Types.ObjectId(assignProjectDto.projectId),
      totalAmount: assignProjectDto.totalAmount,
      remarks: assignProjectDto.remarks || '',
      areaSqMtr: assignProjectDto.areaSqMtr,
      areaSqFt: assignProjectDto.areaSqFt,
      rate: assignProjectDto.rate,
      assignedAt: new Date(),
      isActive: true,
    };

    const updatedAssociate = await this.associateModel
      .findByIdAndUpdate(
        associateId,
        { $push: { projectAssignments: newAssignment } },
        { new: true, runValidators: true }
      )
      .populate('projectAssignments.projectId', 'name description')
      .exec();

    if (!updatedAssociate) {
      throw new NotFoundException('Failed to update associate');
    }

    return updatedAssociate;
  }

  async updateProjectAssignment(
    associateId: string, 
    projectId: string, 
    updateData: Partial<AssignProjectDto>
  ): Promise<Associate> {
    const associate = await this.associateModel.findById(associateId);
    
    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    const assignmentIndex = associate.projectAssignments.findIndex(
      assignment => assignment.projectId.toString() === projectId && assignment.isActive
    );

    if (assignmentIndex === -1) {
      throw new NotFoundException('Project assignment not found');
    }

    // Update the specific assignment
    const updateFields = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields[`projectAssignments.${assignmentIndex}.${key}`] = updateData[key];
      }
    });

    const updatedAssociate = await this.associateModel
      .findByIdAndUpdate(
        associateId,
        { $set: updateFields },
        { new: true, runValidators: true }
      )
      .populate('projectAssignments.projectId', 'name description')
      .exec();

    if (!updatedAssociate) {
      throw new NotFoundException('Failed to update project assignment');
    }

    return updatedAssociate;
  }

  async removeProjectAssignment(associateId: string, projectId: string): Promise<Associate> {
    const associate = await this.associateModel.findById(associateId);
    
    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    const assignmentIndex = associate.projectAssignments.findIndex(
      assignment => assignment.projectId.toString() === projectId && assignment.isActive
    );

    if (assignmentIndex === -1) {
      throw new NotFoundException('Project assignment not found');
    }

    // Mark as inactive instead of removing
    const updatedAssociate = await this.associateModel
      .findByIdAndUpdate(
        associateId,
        { $set: { [`projectAssignments.${assignmentIndex}.isActive`]: false } },
        { new: true }
      )
      .populate('projectAssignments.projectId', 'name description')
      .exec();

    if (!updatedAssociate) {
      throw new NotFoundException('Failed to remove project assignment');
    }

    return updatedAssociate;
  }

  async getAssociateProjects(associateId: string) {
    const associate = await this.associateModel
      .findById(associateId)
      .populate('projectAssignments.projectId', 'name description status budget')
      .exec();

    if (!associate) {
      throw new NotFoundException('Associate not found');
    }

    return associate.projectAssignments.filter(assignment => assignment.isActive);
  }

  async getProjectAssociates(projectId: string) {
    const associates = await this.associateModel
      .find({
        'projectAssignments.projectId': projectId,
        'projectAssignments.isActive': true
      })
      .populate('user_id', 'name email')
      .populate('projectAssignments.projectId', 'name description')
      .exec();

    return associates.map(associate => ({
      associate: {
        id: associate._id,
        fullName: associate.fullName,
        email: associate.email,
        type: associate.type,
        telephone: associate.telephone,
      },
      assignment: associate.projectAssignments.find(
        assignment => assignment.projectId.toString() === projectId && assignment.isActive
      )
    }));
  }

  async exportAssociates(firmId: string) {
    const associates = await this.associateModel
      .find({ firm_id: firmId })
      .populate('user_id', 'name')
      .populate('firm_id', 'name address')
      .populate('projectAssignments.projectId', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return associates.map((associate, index) => ({
      'S.No': index + 1,
      'Full Name': associate.fullName,
      'Email': associate.email,
      'Address': associate.address.fullAddress,
      'Country': associate.address.country,
      'State': associate.address.state,
      'City': associate.address.city,
      'Primary Number': associate.telephone,
      'Additional Number': associate.additionalTelephone || '',
      'Bank Name': associate.bankDetails.bankName,
      'Account Name': associate.bankDetails.accountName,
      'Account Number': associate.bankDetails.accountNumber,
      'IFSC Code': associate.bankDetails.ifscCode,
      'Type': associate.type,
      'Status': associate.status,
      'Active Projects': associate.projectAssignments
        .filter(assignment => assignment.isActive)
        .map(assignment => {
          const project = assignment.projectId as any;
          return project?.name || 'Unknown';
        })
        .join(', '),
      'Total Project Value': associate.projectAssignments
        .filter(assignment => assignment.isActive)
        .reduce((total, assignment) => total + assignment.totalAmount, 0),
    }));
  }
}