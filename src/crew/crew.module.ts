import { Module } from '@nestjs/common';
import { CrewService } from './crew.service';
import { CrewController } from './crew.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Crew, CrewSchema } from './schema/crew.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Crew.name, schema: CrewSchema }]),
  ],
  providers: [CrewService],
  controllers: [CrewController],
})
export class CrewModule {}
