/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class LivrariaService {
  constructor(private readonly configService: ConfigService) {}

  moduloRmq(queue: string): RmqOptions {
    const usuario = this.configService.get('RABBITMQ_USER');
    const senha = this.configService.get('RABBITMQ_PASS');
    const port = this.configService.get('RABBITMQ_HOST');

    return {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${usuario}:${senha}@${port}`],
        noAck: false,
        queue,
        queueOptions: {
          durable: true,
        },
      },
    };
  }
}
