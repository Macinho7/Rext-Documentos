/* eslint-disable prettier/prettier */
import { randomUUID } from 'crypto';
import { genSalt, hash } from 'bcrypt';
import bcrypt from 'bcrypt';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
const { Pool } = pkg;
import { config } from 'dotenv';
import { verificaCampoProibido } from './verificaPalavras/manipulaPalavrasDoCampo.mjs';
import { UnauthorizedException } from '@nestjs/common';
config({ path: '../../.env' });

const pool = new Pool({
  user: 'rextPG',
  database: 'Rext_DB',
  password: 'root2',
  port: 5432,
  max: 500,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});
async function verificaEspacoNome(valor) {
  await verificaCampoProibido(valor);
  const tamanho = valor.length;
  if (tamanho > 25) {
    throw new Error(`Nome: ${valor} muito grande, max 25 caracteres`);
  } else if (tamanho < 5) {
    throw new Error(`Nome: ${valor} muito pequeno, min 5 caracteres`);
  }
}
async function verificaEspacoEmail(valor) {
  const verificacao = valor.includes(' ');
  if (verificacao === true) {
    throw new Error('Campo email possui espaco');
  } else {
    return valor;
  }
}
async function verificaEspacoSenha(valor) {
  const tamanho = valor.length;
  if (tamanho > 40) {
    throw new Error(`senha: ${valor} acima do limite de caracteres`);
  }
  const verificacao = valor.includes(' ');
  if (verificacao === true) {
    throw new Error('Campo senha possui espaco');
  } else {
    return valor;
  }
}
async function verificaEspacoPaís(valor) {
  console.log('Opa especificado', valor);
  await verificaCampoProibido(valor);
  const verificacao = valor.includes(' ');
  if (verificacao === true) {
    throw new Error('Campo país possui espaco');
  } else {
    return valor;
  }
}
async function validarSenha(senha) {
  await verificaCampoProibido(senha);
  const tamanho = senha.length;
  const letraM = /(?=.*[A-Z])/;
  const letram = /(?=.*[a-z])/;
  const numero = /(?=.\d)/;
  const letraMteste = letraM.test(senha);
  const letramteste = letram.test(senha);
  const letraDteste = numero.test(senha);
  if (tamanho < 5) {
    throw new Error(
      `Senha possui: ${tamanho} caracteres, deve ter pelo menos 5 caracteres`,
    );
  }
  if (letraMteste === false) {
    throw new Error('Senha deve ter pelo menos uma letra maiscula');
  }
  if (letramteste === false) {
    throw new Error('Senha deve ter pelo menos uma letra minuscula');
  }
  if (letraDteste === false) {
    throw new Error('Senha deve ter pelo menos um numero');
  }
  return senha;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function verificaNomeEmailExistente(nome, email) {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM "Usuario"');
  const usuarios = result.rows;
  const usuariosFilter = usuarios.filter(
    (usuario) => usuario.deleted === false,
  );
  const usuariosNome = usuariosFilter.map((usuario) => usuario.nome);
  const usuariosEmail = usuariosFilter.map((usuario) => usuario.email);
  const inclui = usuariosNome.includes(nome);
  const inclui2 = usuariosEmail.includes(email);
  if (inclui === true || inclui2 === true) {
    throw new Error(`Nome: ${nome} ou Email: ${email} ja existentes`);
  } else {
    return nome, email;
  }
}
async function verificaNomeEmailWU(id, nome, email) {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM "Usuario"');
  const usuarios = result.rows;
  usuarios.forEach((usuario) => {
    if (usuario.nome === nome || usuario.email === email) {
      if (usuario.id === id) {
        return nome, email;
      } else {
        const nomes = usuarios.map((usuario) => usuario.nome);
        const emails = usuarios.map((usuario) => usuario.email);
        const verificaNome = nomes.includes(nome);
        const verificaEmail = emails.includes(email);
        if (verificaNome === true || verificaEmail === true) {
          throw new Error(`Nome: ${nome} ou Email: ${email} ja existentes`);
        } else {
          return nome, email;
        }
      }
    }
  });
}
async function validarEmail(email) {
  const servicosEmail = [
    'gmail.com',
    'hotmail.com',
    'protonmail.com',
    'yahoo.com',
    'icloud.com',
    'aol.com',
    'zoho.com',
    'yandex.com',
    'gmx.com',
    'mail.com',
    'tutanota.com',
    'fastmail.com',
    'mailfence.com',
    'hushmail.com',
  ];
  const key = '@';
  const contaiKey = email.includes(key);
  if (!contaiKey) {
    throw new Error(`Email: ${email} nao contem chave para servicos email: @`);
  }
  const separaEmail = email.split('@');
  const segundaParte = separaEmail[1];
  const primeiraParte = separaEmail[0];
  await verificaCampoProibido(primeiraParte);
  const verificado = servicosEmail.includes(segundaParte);
  if (verificado === false) {
    throw new Error('Formato de email indisponivel');
  }
  const verificarEmail = servicosEmail.some((servico) =>
    email.includes(servico),
  );
  if (!verificarEmail) {
    throw new Error('Servico de email invalido');
  } else {
    return email;
  }
}
export async function CriaUsuario(valores) {
  const corpo = valores.body;
  const dados = JSON.parse(corpo);
  console.log(dados);
  const id = randomUUID();
  const nome = dados.nome;
  const email = dados.email;
  const senha = dados.senha;
  const idade = dados.idade;
  const país = dados.país;
  await verificaEspacoNome(nome);
  await verificaEspacoSenha(senha);
  await validarSenha(senha);
  const sal = await genSalt(12);
  const senhaHasheada = await hash(senha, sal);
  await verificaEspacoEmail(email);
  await validarEmail(email);
  if (idade < 18 || idade > 120) {
    throw new Error(`Idade ${idade} invalida`);
  }
  await verificaEspacoPaís(país);
  await verificaNomeEmailExistente(nome, email);
  const query =
    'INSERT INTO "Usuario" (id, nome, email, senha, idade, país) VALUES ($1, $2, $3, $4, $5, $6)';

  const values = [id, nome, email, senhaHasheada, idade, país];
  const cliente = await pool.connect();

  try {
    await cliente.query(query, values);
    cliente.release();
    return ['Usuário criado com sucesso:', values];
  } catch (error) {
    cliente.release();
    throw new Error('Erro ao inserir usuário:', values);
  }
}
export async function ListarUsuarios() {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM "Usuario"');
  const usuarios = result.rows;
  const usuariosFilter = usuarios.filter(
    (usuario) => usuario.deleted === false,
  );
  const usuarioSSenha = usuariosFilter.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ senha, ...usuarios }) => usuarios,
  );
  client.release();
  return ['Usuarios:', usuarioSSenha];
}
export async function ListarUsuario(valores) {
  const valor = valores.pathParameters;
  const id = valor.id;
  const cliente = await pool.connect();
  const result2 = await cliente.query('SELECT * FROM "Banidos" WHERE id = $1', [
    id,
  ]);
  const usuariosBan = result2.rows[0];
  if (usuariosBan) {
    throw new UnauthorizedException('Usuario Banido!');
  }
  const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
    id,
  ]);
  const usuario = result.rows[0];
  if (!usuario) {
    throw new Error('Usuario nao existe');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  console.log(usuario);
  const usuarioOB = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    idade: usuario.idade,
    país: usuario.país,
    documentos: usuario.documentos,
    deleted: usuario.deleted,
    created_at: usuario.created_at,
  };
  if (usuario.deleted === true) {
    cliente.release();
    throw new Error('Usuario Foi Deletado');
  } else {
    cliente.release();
    return ['Usuario', usuarioOB];
  }
}
export async function deletaUsuario(valores) {
  const { id } = valores.pathParameters;
  const cliente = await pool.connect();
  const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
    id,
  ]);
  const result2 = await cliente.query('SELECT * FROM "Banidos" WHERE id = $1', [
    id,
  ]);
  const usuariosBan = result2.rows[0];
  if (usuariosBan) {
    throw new UnauthorizedException('Usuario Banido!');
  }
  const usuario = result.rows[0];
  const valorHeader = valores.headers.authorization;
  if (valorHeader === undefined) {
    throw new Error('Token precisa ser inserido');
  }
  const Token = valorHeader.split(' ')[1];
  const chaveBearer = valorHeader.split(' ')[0];
  if (chaveBearer !== 'Bearer') {
    throw new Error('Token precisa ser Bearer');
  }
  if (!usuario) {
    cliente.release();
    throw new Error('Usuario invalido');
  } else {
    try {
      await verificaTokenBearer(usuario, Token);
      if (usuario.deleted === true) {
        throw Error('Usuario ja deletado');
      } else {
        usuario.deleted = true;
        await cliente.query(
          'UPDATE "Usuario" SET "deleted" = $1 WHERE id = $2',
          [usuario.deleted, usuario.id],
        );
        await cliente.query('DELETE FROM "Usuario" WHERE id = $1', [
          usuario.id,
        ]);
        cliente.release();
        return ['Usuario deletado', usuario];
      }
    } catch (error) {
      throw Error(error);
    }
  }
}
async function verificaTokenBearer(usuario, Token) {
  const decode = jwt.decode(Token);
  const idDecode = decode.id;
  if (usuario.id !== idDecode) {
    throw new Error(`Usuario: ${usuario.nome} nao e dono desse token`);
  }
  jwt.verify(Token, process.env.JWT_SEGREDO);
  return usuario;
}
export async function atualizarUsuario(valores) {
  const cliente = await pool.connect();
  const { id } = valores.pathParameters;
  const valorHeader = valores.headers.authorization;
  const result2 = await cliente.query('SELECT * FROM "Banidos" WHERE id = $1', [
    id,
  ]);
  const usuariosBan = result2.rows[0];
  if (usuariosBan) {
    throw new UnauthorizedException('Usuario Banido!');
  }
  if (valorHeader === undefined) {
    throw new Error('Token precisa ser inserido');
  }
  const Token = valorHeader.split(' ')[1];
  const chaveBearer = valorHeader.split(' ')[0];
  if (chaveBearer !== 'Bearer') {
    throw new Error('Token precisa ser Bearer');
  }
  const corpo = valores.body;
  const dados = JSON.parse(corpo);
  const nome = dados.nome;
  const email = dados.email;
  const senha = dados.senha;
  const país = dados.país;
  const idade = dados.idade;
  const sal = await genSalt(12);
  const senhaHasheada = await hash(senha, sal);
  const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
    id,
  ]);
  const usuarioAtualiza = result.rows[0];
  if (!usuarioAtualiza) {
    cliente.release();
    throw new Error('Usuario inexistente');
  } else {
    await verificaTokenBearer(usuarioAtualiza, Token);
    usuarioAtualiza.nome = nome;
    usuarioAtualiza.email = email;
    usuarioAtualiza.senha = senhaHasheada;
    usuarioAtualiza.país = país;
    usuarioAtualiza.idade = idade;
    await verificaEspacoNome(nome);
    await verificaEspacoSenha(senha);
    await validarSenha(senha);
    await verificaEspacoEmail(email);
    await validarEmail(email);
    await verificaNomeEmailWU(usuarioAtualiza.id, nome, email);
    const query1 = `UPDATE "Usuario" SET "nome" = $2,"email" = $3, "senha" = $4, "idade" = $5, "país" = $6   WHERE id = $1`;
    const values1 = [
      usuarioAtualiza.id,
      usuarioAtualiza.nome,
      usuarioAtualiza.email,
      usuarioAtualiza.senha,
      usuarioAtualiza.idade,
      usuarioAtualiza.país,
    ];
    await cliente.query(query1, values1);
    cliente.release();
    return ['Usuario atualizado', usuarioAtualiza];
  }
}
export async function listarUsuariosBanidos() {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM "Banidos"');
  const usuarios = result.rows;
  client.release();
  return ['Usuarios Banidos: ', usuarios];
}
export async function LoginUsuario(values) {
  const Body = values.body;
  const { id } = values.pathParameters;
  const idParam = String(id);
  const corpoOb = JSON.parse(Body);
  const senha = corpoOb.senha;
  const email = corpoOb.email;
  const client = await pool.connect();
  const result2 = await client.query('SELECT * FROM "Banidos" WHERE id = $1', [
    id,
  ]);
  const usuariosBan = result2.rows[0];
  if (usuariosBan) {
    throw new UnauthorizedException('Usuario Banido!');
  }
  const result = await client.query('SELECT * FROM "Usuario"');
  const usuarios = result.rows;
  const usuario = usuarios.find((usuario) => usuario.id === idParam);

  if (usuario) {
    try {
      const senhaUsuarioParam = usuario.senha;
      const nomeUsuarioParam = usuario.nome;
      const senhaVerifica = await bcrypt.compare(senha, senhaUsuarioParam);
      if (usuario.email !== email || senhaVerifica === false) {
        throw new Error(
          `Sr ${nomeUsuarioParam}, Email: ${email} invalido ou Senha: ${senha} invalida`,
        );
      }
      const payload = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      };
      const Token = jwt.sign(payload, process.env.JWT_SEGREDO, {
        expiresIn: '40m', //escolha do usuario
      });
      client.release();
      return ['Login feito, seu Token:', Token];
    } catch (error) {
      client.release();
      throw new Error(error);
    }
  } else {
    throw new Error(`Usuario com id:${idParam} nao existe`);
  }
}
