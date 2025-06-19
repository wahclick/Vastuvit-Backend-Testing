// src/team-reports/team-reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team } from '../team/schema/team.schema';
import { Task } from 'src/tasks/schemas/tasks.schema';
import { Crew } from '../crew/schema/crew.schema';
import { Manager } from 'src/managers/schemas/manager.schema';
import { Firms } from 'src/firms/schemas/firms.schema';
import { Rank } from 'src/ranks/schema/ranks.schema';
import {
  TeamWorkTimeDto,
  TaskDetailDto,
  TeamReportResponseDto,
} from './dto/team-report-response.dto';
interface TeamWorkTime {
  name: string;
  id: string;
  salary: number;
  totalTime: string;
  totalCost: string;
  completedTasks: number;
  designation?: string;
}

interface TaskDetail {
  task: string;
  status: string;
  submit: string;
  timeTaken: string;
  cost: number;
  timeLimit?: string;
  assignedBy?: string;
}

interface TeamReportResponse {
  team: {
    teamId: string;
    header: string;
    headerDesignation: string;
    members: any[];
    projects: any[];
  };
  teamWorkTimes: TeamWorkTime[];
  projectTotals: {
    totalTime: string;
    totalCost: number;
    completedTasks: number;
  };
}

@Injectable()
export class TeamReportsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Crew.name) private crewModel: Model<Crew>,
    @InjectModel(Manager.name) private managerModel: Model<Manager>,
    @InjectModel(Firms.name) private firmModel: Model<Firms>,
    @InjectModel(Rank.name) private rankModel: Model<Rank>,
  ) {}

  async getTeamProjectReport(
    teamId: string,
    projectId: string,
  ): Promise<TeamReportResponseDto> {
    try {
      // 1. Get team data with populated fields
      const team = await this.teamModel
        .findById(teamId)
        .populate('assigned_members')
        .populate('team_head')
        .populate('assigned_projects')
        .exec();

      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }

      // 2. Get firm data for working days and office timing
      const firmData = await this.firmModel.findById(team.firmId).exec();
      if (!firmData) {
        throw new NotFoundException(`Firm data not found`);
      }

      // 3. Get all ranks for designation mapping
      const ranks = await this.rankModel.find({ firmId: team.firmId }).exec();
      const rankMap = this.createRankMap(ranks);

      // 4. Get all tasks for this project
      const tasks = await this.taskModel
        .find({ projectId })
        .populate('assignTo')
        .populate('assignedBy')
        .exec();

      // 5. Get team lead ID
      const teamLeadId = this.extractId(team.team_head);

      // 6. Filter completed tasks assigned by team lead
      const completedTeamLeadTasks = this.filterCompletedTeamLeadTasks(
        tasks,
        teamLeadId,
      );

      // 7. Calculate office settings
      const { totalWorkingDays, salaryTime } =
        this.calculateOfficeSettings(firmData);

      // 8. Process team work times
      const teamWorkTimes = await this.calculateTeamWorkTimes(
        team,
        completedTeamLeadTasks,
        totalWorkingDays,
        salaryTime,
        rankMap,
      );

      // 9. Calculate project totals
      const projectTotals = this.calculateProjectTotals(teamWorkTimes);

      return {
        team: {
          teamId: team.team_name || team._id.toString(),
          header: (team.team_head as any)?.name || 'Unknown',
          headerDesignation: this.getDesignation(team.team_head, rankMap),
          members: team.assigned_members || [],
          projects: team.assigned_projects || [],
        },
        teamWorkTimes,
        projectTotals,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error generating team report: ${error.message}`);
    }
  }

  async getCrewTaskDetails(
    crewId: string,
    projectId: string,
  ): Promise<TaskDetailDto[]> {
    try {
      // Convert string IDs to ObjectIds
      const crewObjectId = new Types.ObjectId(crewId);
      const projectObjectId = new Types.ObjectId(projectId);
  
      console.log('🔍 Searching for crew member:', crewId);
      console.log('📋 In project:', projectId);
  
      // Find the specific team that contains this crew member
      const team = await this.teamModel
        .findOne({
          $or: [
            { assigned_members: crewObjectId },
            { team_head: crewObjectId }
          ]
        })
        .populate('team_head')
        .populate('assigned_members')
        .exec();
  
      if (!team) {
        throw new NotFoundException(`No team found for crew member ${crewId}`);
      }
  
      console.log('🎯 Found team:', team.team_name || team._id);
      console.log('👤 Team head:', (team.team_head as any)?.name);
      console.log('👥 Team members count:', team.assigned_members?.length);
  
      const teamLeadId = this.extractId(team.team_head);
      console.log('🎯 Team lead ID:', teamLeadId);
  
      // Get all tasks for this crew member in this project
      const tasks = await this.taskModel
        .find({ 
          projectId: projectObjectId,
          assignTo: crewObjectId
        })
        .populate('assignedBy')
        .exec();
  
      console.log('📝 All tasks found for crew member:', tasks.length);
      
      // Log a sample task to see the structure
      if (tasks.length > 0) {
        console.log('📋 Sample task structure:', {
          id: tasks[0]._id,
          task: (tasks[0] as any).task || (tasks[0] as any).title,
          status: tasks[0].status,
          assignTo: tasks[0].assignTo,
          assignedBy: tasks[0].assignedBy ? this.extractId(tasks[0].assignedBy) : 'null',
          projectId: tasks[0].projectId,
          timeTaken: (tasks[0] as any).timeTaken
        });
      }
  
      // Filter completed tasks assigned by team lead
      const filteredTasks = this.filterCompletedTeamLeadTasks(tasks, teamLeadId);
      console.log('✅ Tasks after filtering:', filteredTasks.length);
      
      // Log which tasks were filtered out and why
      tasks.forEach((task, index) => {
        const assignedById = this.extractId(task.assignedBy);
        const isAssignedByTeamLead = assignedById === teamLeadId;
        const isCompleted = task.status && task.status.toLowerCase() === 'completed';
        
        console.log(`Task ${index + 1}:`, {
          taskName: (task as any).task || (task as any).title,
          status: task.status,
          assignedBy: assignedById,
          teamLeadId,
          isAssignedByTeamLead,
          isCompleted,
          passesFilter: isAssignedByTeamLead && isCompleted
        });
      });
  
      // If no tasks pass the filter, let's also check what tasks exist without the team lead filter
      if (filteredTasks.length === 0) {
        console.log('🔍 Checking tasks without team lead filter...');
        const completedTasks = tasks.filter(task => 
          task.status && task.status.toLowerCase() === 'completed'
        );
        console.log('📊 Total completed tasks (any assignedBy):', completedTasks.length);
        
        completedTasks.forEach((task, index) => {
          console.log(`Completed Task ${index + 1}:`, {
            taskName: (task as any).task || (task as any).title,
            assignedBy: this.extractId(task.assignedBy),
            assignedByName: (task.assignedBy as any)?.name || 'Unknown'
          });
        });
      }
  
      // Get crew member data for cost calculation
      const crewMember = await this.crewModel.findById(crewId).exec();
      if (!crewMember) {
        throw new NotFoundException(`Crew member ${crewId} not found`);
      }
  
      console.log('👤 Crew member found:', crewMember.name, 'Salary:', crewMember.salary);
  
      // Get firm data for working days
      const firmData = await this.firmModel.findById(team.firmId).exec();
      const { totalWorkingDays, salaryTime } =
        this.calculateOfficeSettings(firmData);
  
      console.log('🏢 Office settings:', { totalWorkingDays, salaryTime });
  
      // Calculate task details with costs
      return filteredTasks.map((task) => {
        const cost = this.calculateTaskCost(
          (task as any).timeTaken || '00:00:00',
          crewMember.salary,
          totalWorkingDays,
          salaryTime,
        );
  
        return {
          task: (task as any).task || (task as any).title || 'N/A',
          status: task.status,
          submit: new Date(task.createdAt).toLocaleDateString('en-GB'),
          timeTaken: (task as any).timeTaken || '00:00:00',
          cost: cost.cost,
          timeLimit: (task as any).timeLimit,
          assignedBy: (task.assignedBy as any)?.name || 'Unknown',
        };
      });
    } catch (error) {
      console.error('❌ Error in getCrewTaskDetails:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error getting crew task details: ${error.message}`);
    }
  }
  private async calculateTeamWorkTimes(
    team: any,
    tasks: any[],
    totalWorkingDays: number,
    salaryTime: number,
    rankMap: Record<string, string>,
  ): Promise<TeamWorkTime[]> {
    const workTimes: TeamWorkTime[] = [];

    // 1. Calculate team head work time (own tasks + supervision)
    const teamHeadWorkTime = await this.calculateTeamHeadWorkTime(
      team,
      tasks,
      totalWorkingDays,
      salaryTime,
      rankMap,
    );
    if (teamHeadWorkTime) {
      workTimes.push(teamHeadWorkTime);
    }

    // 2. Calculate member work times (only completed tasks assigned by team lead)
    for (const member of team.assigned_members || []) {
      const memberWorkTime = await this.calculateMemberWorkTime(
        member,
        tasks,
        totalWorkingDays,
        salaryTime,
        rankMap,
      );
      if (memberWorkTime) {
        workTimes.push(memberWorkTime);
      }
    }

    return workTimes;
  }

  private async calculateTeamHeadWorkTime(
    team: any,
    allTasks: any[],
    totalWorkingDays: number,
    salaryTime: number,
    rankMap: Record<string, string>,
  ): Promise<TeamWorkTime | null> {
    if (!team.team_head) return null;

    const teamHeadId = this.extractId(team.team_head);

    // Get team head's own tasks
    const headOwnTasks = allTasks.filter(
      (task) => this.extractId(task.assignTo) === teamHeadId,
    );

    // Calculate own task time and cost
    let headTaskSeconds = 0;
    let headTaskCost = 0;

    headOwnTasks.forEach((task) => {
      const { cost, totalSeconds } = this.calculateTaskCost(
        task.timeTaken || '00:00:00',
        team.team_head.salary || 50000,
        totalWorkingDays,
        salaryTime,
      );
      headTaskSeconds += totalSeconds;
      headTaskCost += cost;
    });

    // Calculate supervision time and cost
    const { supervisionTime, supervisionCost } = this.calculateSupervisionCost(
      allTasks,
      team.assigned_members || [],
      team.team_head.salary || 50000,
      totalWorkingDays,
      salaryTime,
    );

    // Total time and cost
    const totalTime = headTaskSeconds + supervisionTime;
    const totalCost = headTaskCost + supervisionCost;

    return {
      name: team.team_head.name,
      id: teamHeadId,
      salary: team.team_head.salary || 50000,
      totalTime: this.formatTime(totalTime),
      totalCost: totalCost.toFixed(2),
      completedTasks: headOwnTasks.length,
      designation: this.getDesignation(team.team_head, rankMap),
    };
  }

  private async calculateMemberWorkTime(
    member: any,
    allTasks: any[],
    totalWorkingDays: number,
    salaryTime: number,
    rankMap: Record<string, string>,
  ): Promise<TeamWorkTime | null> {
    if (!member) return null;

    const memberId = this.extractId(member);

    // Get member's tasks
    const memberTasks = allTasks.filter(
      (task) => this.extractId(task.assignTo) === memberId,
    );

    // Calculate total time and cost
    let totalSeconds = 0;
    let totalCost = 0;

    memberTasks.forEach((task) => {
      const { cost, totalSeconds: taskSeconds } = this.calculateTaskCost(
        task.timeTaken || '00:00:00',
        member.salary || 30000,
        totalWorkingDays,
        salaryTime,
      );
      totalSeconds += taskSeconds;
      totalCost += cost;
    });

    return {
      name: member.name,
      id: memberId,
      salary: member.salary || 30000,
      totalTime: this.formatTime(totalSeconds),
      totalCost: totalCost.toFixed(2),
      completedTasks: memberTasks.length,
      designation: this.getDesignation(member, rankMap),
    };
  }

  private calculateSupervisionCost(
    allTasks: any[],
    teamMembers: any[],
    teamHeadSalary: number,
    totalWorkingDays: number,
    salaryTime: number,
  ): { supervisionTime: number; supervisionCost: number } {
    // Get unique crew members who have tasks
    const uniqueCrewWithTasks = new Set();
    let totalCrewTime = 0;

    allTasks.forEach((task) => {
      const assignToId = this.extractId(task.assignTo);
      if (teamMembers.some((member) => this.extractId(member) === assignToId)) {
        uniqueCrewWithTasks.add(assignToId);
        totalCrewTime += this.convertToSeconds(task.timeTaken || '00:00:00');
      }
    });

    const crewCount = uniqueCrewWithTasks.size;
    const supervisionTime = crewCount > 0 ? totalCrewTime / crewCount : 0;

    // Calculate supervision cost using team head's salary
    const { cost: supervisionCost } = this.calculateTaskCost(
      this.formatTime(supervisionTime),
      teamHeadSalary,
      totalWorkingDays,
      salaryTime,
    );

    return { supervisionTime, supervisionCost };
  }

  private filterCompletedTeamLeadTasks(
    tasks: any[],
    teamLeadId: string,
  ): any[] {
    return tasks.filter((task) => {
      // Check if assigned by team lead
      const assignedById = this.extractId(task.assignedBy);
      const isAssignedByTeamLead = assignedById === teamLeadId;

      // Check if completed (case-insensitive)
      const isCompleted =
        task.status && task.status.toLowerCase() === 'completed';

      return isAssignedByTeamLead && isCompleted;
    });
  }

  private calculateTaskCost(
    timeTaken: string,
    salary: number,
    totalWorkingDays: number,
    salaryTime: number,
  ): { cost: number; totalSeconds: number } {
    const totalSeconds = this.convertToSeconds(timeTaken);
    const totalMinutes = totalSeconds / 60;

    const yearlyRate = salary * 12;
    const dailyRate = yearlyRate / totalWorkingDays;
    const hourlyRate = dailyRate / salaryTime;
    const minuteRate = hourlyRate / 60;
    const cost = minuteRate * totalMinutes;

    return { cost: Math.round(cost), totalSeconds };
  }

  private calculateOfficeSettings(firmData: any): {
    totalWorkingDays: number;
    salaryTime: number;
  } {
    const currentYear = new Date().getFullYear();
    const totalWorkingDays =
      firmData.holiday_settings?.[currentYear]?.totalworkingday || 251;
    const officeTiming = firmData.office_timing;
    const salaryTime =
      (officeTiming?.hour || 8) + (officeTiming?.min || 30) / 60;

    return { totalWorkingDays, salaryTime };
  }

  private calculateProjectTotals(teamWorkTimes: TeamWorkTime[]): {
    totalTime: string;
    totalCost: number;
    completedTasks: number;
  } {
    let totalSeconds = 0;
    let totalCost = 0;
    let completedTasks = 0;

    teamWorkTimes.forEach((member) => {
      totalSeconds += this.convertToSeconds(member.totalTime);
      totalCost += parseFloat(member.totalCost);
      completedTasks += member.completedTasks;
    });

    return {
      totalTime: this.formatTime(totalSeconds),
      totalCost: Math.round(totalCost),
      completedTasks,
    };
  }

  private createRankMap(ranks: any[]): Record<string, string> {
    const rankMap: Record<string, string> = {};
    ranks.forEach((rank) => {
      rankMap[rank._id.toString()] = rank.name;
    });
    return rankMap;
  }

  private getDesignation(person: any, rankMap: Record<string, string>): string {
    if (!person) return 'Unknown';

    if (person.rankId) {
      const rankId = this.extractId(person.rankId);
      return rankMap[rankId] || 'Unknown';
    }

    return person.designation || 'Team Member';
  }

  private extractId(obj: any): string {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (obj._id) return obj._id.toString();
    return obj.toString();
  }

  private convertToSeconds(timeStr: string): number {
    if (!timeStr) return 0;
    const [hh, mm, ss] = timeStr.split(':').map(Number);
    return (hh || 0) * 3600 + (mm || 0) * 60 + (ss || 0);
  }

  private formatTime(totalSeconds: number): string {
    const hh = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const mm = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const ss = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}
