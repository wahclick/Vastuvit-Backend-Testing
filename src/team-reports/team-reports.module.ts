// src/team-reports/team-reports.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamReportsController } from './team-reports.controller';
import { TeamReportsService } from './team-reports.service';
import { Team, TeamSchema } from 'src/team/schema/team.schema';
import { Task, TaskSchema } from 'src/tasks/schemas/tasks.schema';
import { Crew, CrewSchema } from 'src/crew/schema/crew.schema';
import { Manager, ManagerSchema } from 'src/managers/schemas/manager.schema';
import { Firms, FirmsSchema } from 'src/firms/schemas/firms.schema';
import { Rank, RankSchema } from 'src/ranks/schema/ranks.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Crew.name, schema: CrewSchema },
      { name: Manager.name, schema: ManagerSchema },
      { name: Firms.name, schema: FirmsSchema },
      { name: Rank.name, schema: RankSchema },
    ]),
  ],
  controllers: [TeamReportsController],
  providers: [TeamReportsService],
  exports: [TeamReportsService],
})
export class TeamReportsModule {}