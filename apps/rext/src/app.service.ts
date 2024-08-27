/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './EntidadeCT/conect.entity';
import { Repository } from 'typeorm';
import jwt from 'jsonwebtoken';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import XLSX from 'xlsx';
import { Banidos } from './EntidadeCT/conectusuariosBanidos';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Usuario)
    readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Banidos)
    readonly usuariosBanidos: Repository<Banidos>,
  ) {}

  async verificaUsuarioExistente(idUsuario: string) {
    const usuarioVerifica = await this.usuarioRepository.findOneBy({
      id: idUsuario,
    });
    if (!usuarioVerifica) {
      throw new NotFoundException('Usuario nao existente');
    }
    return idUsuario;
  }

  async verificaTokenBearer(usuario: any, Token: any) {
    const decode = jwt.decode(Token);
    const corpoD = JSON.stringify(decode);
    const valores = JSON.parse(corpoD);
    const idDecode = valores.id;
    if (usuario.id !== idDecode) {
      throw new Error(`Usuario: ${usuario.nome} nao e dono desse token`);
    }
    jwt.verify(Token, process.env.JWT_SEGREDO);
    return usuario;
  }
  async processaDocumentos(idUsuario: string, file: any, jwtT: any) {
    try {
      await this.verificaUsuarioExistente(idUsuario);
      const jwt = jwtT;
      if (jwt === undefined) {
        throw new Error('Erro na autorizacao do Token');
      }
      const bearerKey = jwt.split(' ')[0];
      const token = jwt.split(' ')[1];
      if (bearerKey !== 'Bearer') {
        throw new Error('Erro na autorizacao');
      }
      const usuario = await this.usuarioRepository.findOneBy({ id: idUsuario });

      await this.verificaTokenBearer(usuario, token);

      if (file === undefined) {
        throw new Error('Voce precisa enviar algum arquivo');
      }
      const fileType = file.mimetype;
      if (
        fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        const response = file.buffer;
        const data = response.data;
        const buffer = Buffer.from(data);
        const xlsxValue = XLSX.read(buffer, { type: 'buffer' });
        const nomeSheet = xlsxValue.SheetNames[0];
        const worksheet = xlsxValue.Sheets[nomeSheet];
        const excelJson = XLSX.utils.sheet_to_json(worksheet);
        excelJson.toString();
        const valoresExcel = [];
        excelJson.map((valor) => valoresExcel.push(valor));
        const objetoValor = {
          Key: file.fieldname,
          Nome: file.originalname,
          Tipo: 'Excel',
          Conteudo: valoresExcel,
        };
        const excelValue = JSON.stringify(objetoValor);
        const excelData = JSON.parse(excelValue);

        usuario.documentos.push(excelData);
        await this.usuarioRepository.save(usuario);
        return ['Documento Enviado!'];
      } else if (
        fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const response = file.buffer;
        const data = response.data;
        const buffer = Buffer.from(data);
        const mammothData = await mammoth.extractRawText({ buffer: buffer });
        const worlText = mammothData;
        const Preconteudo = [worlText.value];
        const conteudo = Preconteudo.map((valor) =>
          valor.replaceAll('\n', ' - '),
        );
        const objetoValor = {
          Key: file.fieldname,
          Nome: file.originalname,
          Tipo: 'World',
          Conteudo: conteudo,
        };
        usuario.documentos.push(objetoValor);
        await this.usuarioRepository.save(usuario);
        return ['Documento Enviado!'];
      } else if (fileType === 'application/pdf') {
        const response = file.buffer;
        const data = response.data;
        const buffer = Buffer.from(data);
        const valorDoPDf = await pdfParse(buffer);
        const textValuePDF = [valorDoPDf.text];
        const textoPdf = textValuePDF.map((linha) =>
          linha.replaceAll('\n', '-'),
        );
        const objetoValor = {
          Key: file.fieldname,
          Nome: file.originalname,
          Tipo: 'PDF',
          Conteudo: textoPdf,
        };
        usuario.documentos.push(objetoValor);
        await this.usuarioRepository.save(usuario);
        return ['Documento Enviado!'];
      } else if (fileType === 'text/markdown') {
        console.log('Arquivo e MD');
        const response = file.buffer;
        const data = response.data;
        const buffer = Buffer.from(data);
        const mdBuffer = buffer;
        const PretextoMd = [mdBuffer.toString('utf-8')];
        const textoMd = PretextoMd.map((linha) => linha.replaceAll('\n', '  '));
        const objetoValor = {
          Key: file.fieldname,
          Nome: file.originalname,
          Tipo: 'MD-MARKDOWN',
          Conteudo: textoMd,
        };
        usuario.documentos.push(objetoValor);
        await this.usuarioRepository.save(usuario);
        return ['Documento Enviado!'];
      } else {
        throw new Error('Arquivos apenas como PDF, WORD, EXCEL ou MD');
      }
    } catch (error) {
      throw Error(error);
    }
  }
}
