/* eslint-disable prettier/prettier */
import {
  Controller,
  Headers,
  Inject,
  Param,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  erroNoCampoFile,
  payloadGrandeException,
} from './exceptionFilter/exceptions';

@Controller()
export class GertController {
  constructor(
    @Inject('Rext_QUEUE') private readonly authServico: ClientProxy,
  ) {}

  @UseFilters(payloadGrandeException, erroNoCampoFile)
  @Post('enviaDocumento/:id')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 } }), //100KB limit
  )
  async docs(
    @Param('id') idUsuario: string,
    @UploadedFile() file: any,
    @Headers('authorization') jwtT: string,
  ) {
    return this.authServico.send(
      {
        cmd: 'process-documents',
      },
      { idUsuario, file, jwtT },
    );
  }
}
