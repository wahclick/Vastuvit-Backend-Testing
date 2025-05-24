import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from './schema/team.schema';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    const newTeam = new this.teamModel(createTeamDto);
    return newTeam.save();
  }

  async findAllTeams(): Promise<Team[]> {
    return this.teamModel.find().exec();
  }

  async findTeamsByFirm(firmId: string): Promise<Team[]> {
    return this.teamModel.find({ firmId }).exec();
  }

  async findTeamsByManager(userId: string): Promise<Team[]> {
    // Convert string to ObjectId for manager search
    const objectId = new Types.ObjectId(userId);
    return this.teamModel.find({ managerId: objectId }).exec();
  }

  async findTeamsByTeamHead(teamHeadId: string): Promise<Team[]> {
    // Convert string to ObjectId for team head search
    const objectId = new Types.ObjectId(teamHeadId);
    return this.teamModel.find({ teamHeadId: objectId }).exec();
  }

  async findTeamsByCrewMember(crewId: string): Promise<Team[]> {
    try {
      // Convert string to ObjectId for member search
      const objectId = new Types.ObjectId(crewId);
      console.log('Searching for teams with member ObjectId:', objectId);
      
      // Use the correct field name: assigned_members instead of members
      const teams = await this.teamModel.find({ assigned_members: objectId }).exec();
      console.log('Found teams:', teams.length);
      
      return teams;
    } catch (error) {
      console.error('Error in findTeamsByCrewMember:', error);
      throw new NotFoundException(`Invalid user ID format: ${crewId}`);
    }
  }
  async findTeamById(id: string): Promise<Team> {
    try {
      const objectId = new Types.ObjectId(id);
      const team = await this.teamModel.findById(objectId).exec();
      if (!team) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }
      return team;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Invalid team ID format: ${id}`);
    }
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    try {
      const objectId = new Types.ObjectId(id);
      const updatedTeam = await this.teamModel
        .findByIdAndUpdate(objectId, updateTeamDto, { new: true })
        .exec();
      if (!updatedTeam) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }
      return updatedTeam;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Invalid team ID format: ${id}`);
    }
  }

  async deleteTeam(id: string): Promise<Team> {
    try {
      const objectId = new Types.ObjectId(id);
      const deletedTeam = await this.teamModel.findByIdAndDelete(objectId).exec();
      if (!deletedTeam) {
        throw new NotFoundException(`Team with ID ${id} not found`);
      }
      return deletedTeam;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Invalid team ID format: ${id}`);
    }
  }

  async addProjectToTeam(teamId: string, projectId: string): Promise<Team> {
    try {
      const teamObjectId = new Types.ObjectId(teamId);
      const projectObjectId = new Types.ObjectId(projectId);
      
      const team = await this.teamModel
        .findByIdAndUpdate(
          teamObjectId,
          { $addToSet: { projects: projectObjectId } },
          { new: true },
        )
        .exec();
      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }
      return team;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Invalid ID format`);
    }
  }

  async removeProjectFromTeam(teamId: string, projectId: string): Promise<Team> {
    try {
      const teamObjectId = new Types.ObjectId(teamId);
      const projectObjectId = new Types.ObjectId(projectId);
      
      const team = await this.teamModel
        .findByIdAndUpdate(
          teamObjectId,
          { $pull: { projects: projectObjectId } },
          { new: true },
        )
        .exec();
      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }
      return team;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Invalid ID format`);
    }
  }

  async addMemberToTeam(teamId: string, crewId: string): Promise<Team> {
    try {
      const teamObjectId = new Types.ObjectId(teamId);
      const crewObjectId = new Types.ObjectId(crewId);
      
      const team = await this.teamModel
        .findByIdAndUpdate(
          teamObjectId,
          { $addToSet: { members: crewObjectId } },
          { new: true },
        )
        .exec();
      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }
      return team;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Invalid ID format`);
    }
  }

  async removeMemberFromTeam(teamId: string, crewId: string): Promise<Team> {
    try {
      const teamObjectId = new Types.ObjectId(teamId);
      const crewObjectId = new Types.ObjectId(crewId);
      
      const team = await this.teamModel
        .findByIdAndUpdate(
          teamObjectId, 
          { $pull: { members: crewObjectId } }, 
          { new: true }
        )
        .exec();
      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }
      return team;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Invalid ID format`);
    }
  }
}