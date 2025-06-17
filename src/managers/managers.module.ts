import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Manager, ManagerSchema } from './schemas/manager.schema';
import { FirmsModule } from 'src/firms/firms.module';
import { RanksModule } from 'src/ranks/ranks.module';
import { DesignationsModule } from 'src/designations/designations.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Manager.name, schema: ManagerSchema }]),
    FirmsModule,
    RanksModule,
    DesignationsModule
  ],
  providers: [ManagersService],
  controllers: [ManagersController],
  exports: [ManagersService],
})
export class ManagersModule {}
