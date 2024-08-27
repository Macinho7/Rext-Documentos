/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'process-documents' })
  async enviaDocumento(
    @Ctx() contexto: RmqContext,
    @Payload() payload: { idUsuario: string; file: any; jwtT: string },
  ) {
    const channel = contexto.getChannelRef();
    const message = contexto.getMessage();
    channel.ack(message);

    return this.appService.processaDocumentos(
      payload.idUsuario,
      payload.file,
      payload.jwtT,
    );
  }
}
