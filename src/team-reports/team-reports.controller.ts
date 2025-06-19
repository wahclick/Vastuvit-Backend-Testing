// src/team-reports/team-reports.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TeamReportsService } from './team-reports.service';

@Controller('team-reports')
export class TeamReportsController {
  constructor(private readonly teamReportsService: TeamReportsService) {}

  @Get(':teamId/project/:projectId')
  async getTeamProjectReport(
    @Param('teamId') teamId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.teamReportsService.getTeamProjectReport(
        teamId,
        projectId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error generating team project report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('crew/:crewId/tasks/:projectId')
  async getCrewTaskDetails(
    @Param('crewId') crewId: string,
    @Param('projectId') projectId: string,
  ) {
    try {
      return await this.teamReportsService.getCrewTaskDetails(
        crewId,
        projectId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error getting crew task details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
