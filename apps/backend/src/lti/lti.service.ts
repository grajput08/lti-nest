import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Provider as lti } from 'ltijs';
import SequelizeDB from 'ltijs-sequelize';
import { Request, Response } from 'express';

@Injectable()
export class LtiService implements OnModuleInit {
  private readonly logger = new Logger(LtiService.name);

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

    lti.setup(
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
    lti.onConnect((token: any, req: Request, res: Response) => {
      this.logger.log('🔗 LTI Launch Successful:', token);
      return res.send('LTI Connection Successful!');
    });

    this.logger.log('🚀 LTI Launch Handler Registered');
  }

  async deploy(server: any) {
    await lti.deploy({ server, serverless: true });
    await this.registerCanvas();
    this.logger.log(`Server running on port ${process.env.PORT || 8080}`);
  }

  async registerCanvas() {
    await lti.registerPlatform({
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

    this.logger.log('Canvas LMS Registered Successfully');
  }

  use(req: Request, res: Response, next: () => void) {
    this.logger.log(`!!!!!!Signed Cookies [${req.signedCookies}]`);
    this.logger.log(`LTI middleware running for URL [${req.url}]`);
    lti.app(req, res, next);
  }
}
