/* eslint-disable prettier/prettier */
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('Usuario')
export class Usuario {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  senha: string;

  @Column({ type: 'integer' })
  idade: number;

  @Column({ type: 'varchar', length: 100 })
  país: string;

  @Column({ type: 'json', default: () => `'[]'` })
  documentos: any[];

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column({ type: 'integer', default: 0 })
  bannedcount: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
