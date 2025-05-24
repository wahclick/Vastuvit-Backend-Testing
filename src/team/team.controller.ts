// src/team/team.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto) {
    return this.teamService.createTeam(createTeamDto);
  }

  @Get()
  findAllTeams() {
    return this.teamService.findAllTeams();
  }

  // Put all specific routes BEFORE the generic :id route
  @Get('firm/:firmId')
  findTeamsByFirm(@Param('firmId') firmId: string) {
    return this.teamService.findTeamsByFirm(firmId);
  }

  @Get('manager/:userId')
  findTeamsByManager(@Param('userId') userId: string) {
    return this.teamService.findTeamsByManager(userId);
  }

  @Get('head/:teamHeadId')
  findTeamsByTeamHead(@Param('teamHeadId') teamHeadId: string) {
    return this.teamService.findTeamsByTeamHead(teamHeadId);
  }

  @Get('member/:crewId')
  findTeamsByCrewMember(@Param('crewId') crewId: string) {
    return this.teamService.findTeamsByCrewMember(crewId);
  }

  // Put the generic :id route LAST
  @Get(':id')
  findTeamById(@Param('id') id: string) {
    return this.teamService.findTeamById(id);
  }

  @Put(':id')
  updateTeam(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamService.updateTeam(id, updateTeamDto);
  }

  @Delete(':id')
  deleteTeam(@Param('id') id: string) {
    return this.teamService.deleteTeam(id);
  }

  @Post(':id/projects/:projectId')
  addProjectToTeam(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
  ) {
    return this.teamService.addProjectToTeam(id, projectId);
  }

  @Delete(':id/projects/:projectId')
  removeProjectFromTeam(
    @Param('id') id: string,
    @Param('projectId') projectId: string,
  ) {
    return this.teamService.removeProjectFromTeam(id, projectId);
  }

  @Post(':id/members/:crewId')
  addMemberToTeam(@Param('id') id: string, @Param('crewId') crewId: string) {
    return this.teamService.addMemberToTeam(id, crewId);
  }

  @Delete(':id/members/:crewId')
  removeMemberFromTeam(
    @Param('id') id: string,
    @Param('crewId') crewId: string,
  ) {
    return this.teamService.removeMemberFromTeam(id, crewId);
  }
}