import { Module } from '@nestjs/common';
import { CrewService } from './crew.service';
import { CrewController } from './crew.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Crew, CrewSchema } from './schema/crew.schema';
import { DesignationsModule } from 'src/designations/designations.module';
import { RanksModule } from 'src/ranks/ranks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Crew.name, schema: CrewSchema }]),
    DesignationsModule,
    RanksModule, // Add RanksModule import
  ],
  providers: [CrewService],
  controllers: [CrewController],
})
export class CrewModule {}
