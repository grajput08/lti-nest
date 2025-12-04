import { Dialect } from 'sequelize';

export class DatabaseConfigDto {
  host: string;
  port: number;
  dialect: Dialect;
  logging?: boolean | ((sql: string, timing?: number) => void);

  constructor(config?: Partial<DatabaseConfigDto>) {
    this.host = config?.host || '';
    this.port = config?.port || 5432;
    this.dialect = (config?.dialect as Dialect) || 'postgres';
    this.logging = config?.logging ?? false;
  }
}
