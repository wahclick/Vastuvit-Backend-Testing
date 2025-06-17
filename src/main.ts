import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get the Mongoose connection from the application context
  const connection = app.get<Connection>(getConnectionToken());
  connection.on('connected', () => {
    console.log('Successfully connected to MongoDB Atlas');
  });
  connection.on('error', (err) => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

  app.enableCors({
    origin: ['http://localhost:19006', 'http://127.0.0.1:19006'], // Add both localhost and 127.0.0.1
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], // Fixed typo: OPTION -> OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
}
bootstrap();