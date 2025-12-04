import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SequelizeDB from 'ltijs-sequelize';

interface DatabaseOptions {
  host: string;
  port: number;
  dialect: 'postgres';
  logging: boolean;
}

@Injectable()
export class LtiDatabaseService {
  constructor(private configService: ConfigService) {}

  createDatabasePlugin(): unknown {
    const dbName = this.configService.get<string>('DB_NAME') || 'lti_database';
    const dbUser = this.configService.get<string>('DB_USER') || 'postgres';
    const dbPassword = this.configService.get<string>('DB_PASSWORD') || '';
    const dbHost = this.configService.get<string>('DB_HOST') || 'localhost';
    const dbPort = Number(this.configService.get<string>('DB_PORT')) || 5432;

    const options: DatabaseOptions = {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: false,
    };

    return new SequelizeDB(dbName, dbUser, dbPassword, options);
  }
}
