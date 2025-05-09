import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManagersModule } from './managers/managers.module';
import { FirmsModule } from './firms/firms.module';
import { AuthModule } from './auth/auth.module';
import { RanksModule } from './ranks/ranks.module';
import { DesignationsModule } from './designations/designations.module';
import { CrewModule } from './crew/crew.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),

    ManagersModule,
    FirmsModule,
    AuthModule,
    RanksModule,
    DesignationsModule,
    CrewModule,
    ClientsModule,
    ProjectsModule,
    TasksModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
