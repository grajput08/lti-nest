declare module 'ltijs-sequelize' {
  import { Dialect } from 'sequelize';

  export interface SequelizeDBConfig {
    host: string;
    port: number;
    dialect: Dialect;
    logging?: boolean | ((sql: string, timing?: number) => void);
    [key: string]: any;
  }

  class SequelizeDB {
    constructor(
      dbName: string,
      dbUser: string,
      dbPassword: string,
      config: SequelizeDBConfig,
    );
  }

  export default SequelizeDB;
}
