import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManagersModule } from './managers/managers.module';
import { FirmsModule } from './firms/firms.module';

@Module({
  imports: [
    // ConfigModule to load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Path to the .env file
    }),

    // MongooseModule to handle the MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // Use MongoDB URI from the environment
      }),
      inject: [ConfigService],
    }),

    ManagersModule,

    FirmsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
