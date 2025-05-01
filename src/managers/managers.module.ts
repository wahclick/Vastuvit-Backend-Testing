import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Manager, ManagerSchema } from './schemas/manager.schema';
import { FirmsModule } from 'src/firms/firms.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Manager.name, schema: ManagerSchema}]),
    FirmsModule
  ],
  providers: [ManagersService],
  controllers: [ManagersController]
})
export class ManagersModule {}
