import pkg from 'pg';
const { Pool } = pkg;

// Configuração da conexão com o banco de dados
const pool = new Pool({
  user: 'rextPG',
  database: 'Rext_DB',
  password: 'root2',
  port: 5432,
  max: 500,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});
const criaTabelas = `
  CREATE TABLE IF NOT EXISTS "Usuario" (
    id UUID PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    idade INTEGER NOT NULL,
    país VARCHAR(100) NOT NULL,
    documentos JSON DEFAULT '[]'::JSON,
    deleted BOOLEAN DEFAULT FALSE,
    bannedCount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS "Banidos" (
    id UUID PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    idade INTEGER NOT NULL,
    país VARCHAR(100) NOT NULL,
    documentos JSON DEFAULT '[]'::JSON,
    deleted BOOLEAN DEFAULT FALSE,
    bannedCount INTEGER NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

export async function createTable() {
  try {
    const client = await pool.connect();
    await client.query(criaTabelas);
    client.release();
    return ['Tabelas criadas com sucesso'];
  } catch (error) {
    throw Error('Erro ao criar a tabela:', error);
  }
}
