import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://local.tfg.spa:80',
    credentials: true, // Permitir el envío de cookies
  });

  app.use('/files', express.static(join(__dirname, '..', '..', 'files')));

  await app.listen(3000);
}
bootstrap();
