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
    return this.teamModel
      .find()
      .populate('team_head')
      .populate('assigned_projects')
      .populate('assigned_members')
      .exec();
  }

  async findTeamsByFirm(firmId: string): Promise<Team[]> {
    return this.teamModel
      .find({ firmId })
      .populate('team_head') // This should reference your Crew collection
      .populate('assigned_projects') // This should reference your Project collection
      .populate('assigned_members') // This should reference your Crew collection
      .exec();
  }

  async findTeamsByManager(userId: string): Promise<Team[]> {
    const objectId = new Types.ObjectId(userId);
    return this.teamModel
      .find({ userId: objectId })
      .populate('team_head')
      .populate('assigned_projects')
      .populate('assigned_members')
      .exec();
  }

  async findTeamsByTeamHead(teamHeadId: string): Promise<Team[]> {
    const objectId = new Types.ObjectId(teamHeadId);
    return this.teamModel
      .find({ team_head: objectId }) // Fixed field name
      .populate('team_head')
      .populate('assigned_projects')
      .populate('assigned_members')
      .exec();
  }

  async findTeamsByCrewMember(crewId: string): Promise<Team[]> {
    try {
      const objectId = new Types.ObjectId(crewId);
      console.log('Searching for teams with member ObjectId:', objectId);
      
      const teams = await this.teamModel
        .find({ assigned_members: objectId })
        .populate('team_head')
        .populate('assigned_projects')
        .populate('assigned_members')
        .exec();
      
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
      const team = await this.teamModel
        .findById(objectId)
        .populate('team_head')
        .populate('assigned_projects')
        .populate('assigned_members')
        .exec();
      
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
        .populate('team_head')
        .populate('assigned_projects')
        .populate('assigned_members')
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
          { $addToSet: { assigned_projects: projectObjectId } }, // Fixed field name
          { new: true },
        )
        .populate('team_head')
        .populate('assigned_projects')
        .populate('assigned_members')
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
          { $pull: { assigned_projects: projectObjectId } }, // Fixed field name
          { new: true },
        )
        .populate('team_head')
        .populate('assigned_projects')
        .populate('assigned_members')
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
          { $addToSet: { assigned_members: crewObjectId } }, // Fixed field name
          { new: true },
        )
        .populate('team_head')
        .populate('assigned_projects')
        .populate('assigned_members')
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
          { $pull: { assigned_members: crewObjectId } }, // Fixed field name
          { new: true }
        )
        .populate('team_head')
        .populate('assigned_projects')
        .populate('assigned_members')
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