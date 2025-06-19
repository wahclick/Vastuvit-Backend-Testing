// src/team-reports/dto/team-report-response.dto.ts
export interface TeamWorkTimeDto {
  name: string;
  id: string;
  salary: number;
  totalTime: string;
  totalCost: string;
  completedTasks: number;
  designation?: string;
}

export interface ProjectTotalsDto {
  totalTime: string;
  totalCost: number;
  completedTasks: number;
}

export interface TeamReportResponseDto {
  team: {
    teamId: string;
    header: string;
    headerDesignation: string;
    members: any[];
    projects: any[];
  };
  teamWorkTimes: TeamWorkTimeDto[];
  projectTotals: ProjectTotalsDto;
}

export interface TaskDetailDto {
  task: string;
  status: string;
  submit: string;
  timeTaken: string;
  cost: number;
  timeLimit?: string;
  assignedBy?: string;
}
