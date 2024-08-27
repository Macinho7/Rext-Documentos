/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LivrariaModule, rmqModule } from '@app/livraria';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './EntidadeCT/conect.entity';
import { Banidos } from './EntidadeCT/conectusuariosBanidos';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Banidos]),
    rmqModule,
    LivrariaModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppController],
})
export class AppModule {}
