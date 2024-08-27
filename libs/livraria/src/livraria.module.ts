/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { LivrariaService } from './livraria.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('POSTGRES_URI'),
        autoLoadEntities: true,
        entities: [__dirname + '/../**/*.entity{.js, .ts}'],
        //synchronize: true . evitar durante perda de dados
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [LivrariaService],
  exports: [LivrariaService],
})
export class LivrariaModule {}
