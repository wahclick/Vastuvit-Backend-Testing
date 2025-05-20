import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
    return this.teamModel.find({ managerId: userId }).exec();
  }

  async findTeamsByTeamHead(teamHeadId: string): Promise<Team[]> {
    return this.teamModel.find({ teamHeadId }).exec();
  }

  async findTeamsByCrewMember(crewId: string): Promise<Team[]> {
    return this.teamModel.find({ members: crewId }).exec();
  }

  async findTeamById(id: string): Promise<Team> {
    const team = await this.teamModel.findById(id).exec();
    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    return team;
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const updatedTeam = await this.teamModel
      .findByIdAndUpdate(id, updateTeamDto, { new: true })
      .exec();
    
    if (!updatedTeam) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    
    return updatedTeam;
  }

  async deleteTeam(id: string): Promise<Team> {
    const deletedTeam = await this.teamModel.findByIdAndDelete(id).exec();
    
    if (!deletedTeam) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
    
    return deletedTeam;
  }

  async addProjectToTeam(teamId: string, projectId: string): Promise<Team> {
    const team = await this.teamModel
      .findByIdAndUpdate(
        teamId,
        { $addToSet: { projects: projectId } },
        { new: true },
      )
      .exec();
    
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    
    return team;
  }

  async removeProjectFromTeam(
    teamId: string,
    projectId: string,
  ): Promise<Team> {
    const team = await this.teamModel
      .findByIdAndUpdate(
        teamId,
        { $pull: { projects: projectId } },
        { new: true },
      )
      .exec();
    
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    
    return team;
  }

  async addMemberToTeam(teamId: string, crewId: string): Promise<Team> {
    const team = await this.teamModel
      .findByIdAndUpdate(
        teamId,
        { $addToSet: { members: crewId } },
        { new: true },
      )
      .exec();
    
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    
    return team;
  }

  async removeMemberFromTeam(teamId: string, crewId: string): Promise<Team> {
    const team = await this.teamModel
      .findByIdAndUpdate(teamId, { $pull: { members: crewId } }, { new: true })
      .exec();
    
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    
    return team;
  }
}