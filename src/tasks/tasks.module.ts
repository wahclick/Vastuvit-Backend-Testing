// tasks.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskSchema } from './schemas/tasks.schema';
import { CrewSchema, Crew } from 'src/crew/schema/crew.schema';
import { Manager, ManagerSchema } from 'src/managers/schemas/manager.schema'; // Add this
import { Firms, FirmsSchema } from 'src/firms/schemas/firms.schema'; // Add this
import { Project, ProjectSchema } from 'src/projects/schemas/projects.schema'; // Add this

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Crew.name, schema: CrewSchema },
      { name: Manager.name, schema: ManagerSchema }, // Add this
      { name: Firms.name, schema: FirmsSchema }, // Add this
      { name: Project.name, schema: ProjectSchema }, // Add this
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}