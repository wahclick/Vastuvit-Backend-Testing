import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PrintService } from './print.service';
import { PrintController } from './print.controller';
import { Print, PrintSchema } from './schema/print.schema';
import { ManagerSchema } from 'src/managers/schemas/manager.schema';
import { CrewSchema } from 'src/crew/schema/crew.schema';
import { ProjectSchema } from 'src/projects/schemas/projects.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Print.name, schema: PrintSchema },
      { name: 'Manager', schema:  ManagerSchema},
      { name: 'Crew', schema: CrewSchema },
      { name: 'Project', schema: ProjectSchema }
    ])
  ],
  controllers: [PrintController],
  providers: [PrintService],
  exports: [PrintService]
})
export class PrintModule {}