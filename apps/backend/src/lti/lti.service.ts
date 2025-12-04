import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Provider from 'ltijs';
import SequelizeDB from 'ltijs-sequelize';
import { Request, Response } from 'express';

@Injectable()
export class LtiService implements OnModuleInit {
  private readonly logger = new Logger(LtiService.name);
  private lti: typeof Provider;

  constructor() {
    const db = new SequelizeDB(
      process.env.DB_NAME || '',
      process.env.DB_USER || '',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || '',
        port: Number(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false,
      },
    );

    this.lti = new Provider(
      process.env.LTI_KEY || 'LTI_KEY',
      {
        plugin: db,
      },
      {
        appUrl: `${process.env.APP_URL}`,
        loginUrl: '/login',
        cookies: {
          secure: false,
          sameSite: '',
        },
        devMode: true,
      },
    );
  }

  async onModuleInit() {
    this.lti.onConnect((token: any, req: Request, res: Response) => {
      this.logger.log('🔗 LTI Launch Successful:', token);
      return res.send('LTI Connection Successful!');
    });

    this.logger.log('🚀 LTI Launch Handler Registered');
  }

  async deploy(server: any) {
    await this.lti.deploy({ server, serverless: true });
    await this.registerCanvas();
    this.logger.log(`Server running on port ${process.env.PORT || 3000}`);
  }

  async registerCanvas() {
    await this.lti.registerPlatform({
      url: 'https://canvas.instructure.com',
      name: 'Canvas LMS',
      clientId: process.env.CANVAS_CLIENT_ID,
      authenticationEndpoint: `${process.env.CANVAS_URL}/api/lti/authorize_redirect`,
      accesstokenEndpoint: `${process.env.CANVAS_URL}/login/oauth2/token`,
      authConfig: {
        method: 'JWK_SET',
        key: `${process.env.CANVAS_URL}/api/lti/security/jwks`,
      },
    });

    this.logger.log('🎓 Canvas LMS Registered Successfully');
  }

  getApp() {
    return this.lti.app;
  }
}
