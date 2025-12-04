import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SequelizeDB from 'ltijs-sequelize';

@Injectable()
export class LtiDatabaseService {
  constructor(private configService: ConfigService) {}

  createDatabasePlugin() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return new SequelizeDB(
      this.configService.get<string>('DB_NAME') || '',
      this.configService.get<string>('DB_USER') || '',
      this.configService.get<string>('DB_PASSWORD') || '',
      {
        host: this.configService.get<string>('DB_HOST') || 'localhost',
        port: Number(this.configService.get<string>('DB_PORT')) || 5432,
        dialect: 'postgres',
        logging: false,
      },
    );
  }
}
