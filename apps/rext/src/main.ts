/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LivrariaService } from '@app/livraria';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const libsService = app.get(LivrariaService);
  const configService = app.get(ConfigService);

  const queue = configService.get('RABBITMQ_AUTH_QUEUE');
  app.connectMicroservice(libsService.moduloRmq(queue));
  app.startAllMicroservices();
}
bootstrap();
