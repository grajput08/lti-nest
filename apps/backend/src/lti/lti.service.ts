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
      process.env.LTI_KEY ||
        'FXA3279DQUwwe7WTr9KwJU3N34zYDvFV9rLG97Eh7MGHewn6HHxQ7rJcDFLDa8Ta',
      {
        plugin: db,
      },
      {
        appRoute: `${process.env.APP_URL}`,
        loginRoute: '/login',
        tokenMaxAge: `${process.env.TOKEN_MAX_AGE || 6000}`,
        cookies: {
          secure: false,
          sameSite: '',
        },
        devMode: true,
      },
    );

    // Allow both GET + POST for login (Canvas uses GET, Moodle uses POST)
    lti.whitelist(
      { route: /^\/login$/, method: 'get' },
      { route: /^\/login$/, method: 'post' },
    );

    this.logger.log(
      '✅ LTI Setup Complete - Login route whitelisted for GET and POST',
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
    this.logger.log(`TOKEN_MAX_AGE: ${process.env.TOKEN_MAX_AGE}`);
    await lti.deploy({ server, serverless: true });
    await this.registerCanvas();
    this.logger.log(`Server running on port ${process.env.PORT || 3000}`);
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
    this.logger.log(`🔥 LTI Middleware HIT → ${req.method} ${req.url}`);
    this.logger.log(`Signed Cookies: [${JSON.stringify(req.signedCookies)}]`);
    this.logger.log(`Query Params: [${JSON.stringify(req.query)}]`);
    // Note: Body is not parsed here - ltijs will handle it to avoid stream consumption issues
    lti.app(req, res, next);
  }
}
