/* eslint-disable prettier/prettier */
import { DataSource, DataSourceOptions } from 'typeorm';
import { Usuario } from '../EntidadeCT/conect.entity';
import { Banidos } from '../EntidadeCT/conectusuariosBanidos';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URI,
  entities: [Usuario, Banidos],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export { dataSource };
