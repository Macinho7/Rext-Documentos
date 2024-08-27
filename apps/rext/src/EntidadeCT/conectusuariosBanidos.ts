/* eslint-disable prettier/prettier */
import { Column, DeleteDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('Banidos')
export class Banidos {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 100 })
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

  @DeleteDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  deleted_at: Date;
}
