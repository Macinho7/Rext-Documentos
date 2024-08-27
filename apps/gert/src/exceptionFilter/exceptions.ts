/* eslint-disable prettier/prettier */
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(PayloadTooLargeException)
export class payloadGrandeException implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const contexto = host.switchToHttp();
    const resposta = contexto.getResponse<Response>();
    resposta.status(413).json({
      statusCode: 413,
      error: 'Arquivo acima do Limite',
      message:
        'O arquivo enviado e acima do limite de arquivos da api, enviar um arquivo com as exigencias do site.',
    });
  }
}
@Catch(BadRequestException)
export class erroNoCampoFile implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const contexto = host.switchToHttp();
    const resposta = contexto.getResponse<Response>();
    resposta.status(400).json({
      statusCode: 400,
      error: 'Erro',
      message: 'Campo nao previsto como padrao.',
    });
  }
}
@Catch(InternalServerErrorException)
export class erroInternoServidor implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contexto = host.switchToHttp();
    const resposta = contexto.getResponse<Response>();
    resposta.status(500).json({
      statusCode: 500,
      error: 'Erro no servidor',
      message: 'Erro interno no Servidor',
    });
  }
}
