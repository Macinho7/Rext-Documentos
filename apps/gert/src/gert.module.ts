/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { GertController } from './gert.controller';
import { LivrariaModule, rmqModule } from '@app/livraria';
import { AppService } from 'apps/rext/src/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'apps/rext/src/EntidadeCT/conect.entity';
import { Banidos } from 'apps/rext/src/EntidadeCT/conectusuariosBanidos';

@Module({
  imports: [
    rmqModule.registrarRmq('Rext_QUEUE', process.env.RABBITMQ_AUTH_QUEUE),
    TypeOrmModule.forFeature([Usuario, Banidos]),
    LivrariaModule,
  ],
  controllers: [GertController],
  providers: [AppService],
})
export class GertModule {}
