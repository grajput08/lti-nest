import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from 'ltijs';
import { Request, Response } from 'express';
import { LtiDatabaseService } from './lti-database.service';
import { getCanvasPlatformConfig } from './canvas.config';

@Injectable()
export class LtiService {
  private readonly logger = new Logger(LtiService.name);

  constructor(
    private configService: ConfigService,
    private ltiDatabaseService: LtiDatabaseService,
  ) {}

  async initialize(server: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const db = this.ltiDatabaseService.createDatabasePlugin();

    this.logger.log(
      `🔧 Initializing LTI with key: ${this.configService.get<string>('LTI_KEY')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with database: ${this.configService.get<string>('DB_NAME')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with database user: ${this.configService.get<string>('DB_USER')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with database password: ${this.configService.get<string>('DB_PASSWORD')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with database host: ${this.configService.get<string>('DB_HOST')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with database port: ${this.configService.get<string>('DB_PORT')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with app URL: ${this.configService.get<string>('APP_URL')}`,
    );
    this.logger.log(`🔧 Initializing LTI with login URL: /login`);
    this.logger.log(
      `🔧 Initializing LTI with cookies: ${this.configService.get<string>('NODE_ENV') !== 'local'}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with dev mode: ${this.configService.get<string>('NODE_ENV') === 'local'}`,
    );
    this.logger.log(`🔧 Initializing LTI with token max age: 300`);
    this.logger.log(
      `🔧 Initializing LTI with canvas URL: ${this.configService.get<string>('CANVAS_URL')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with canvas client ID: ${this.configService.get<string>('CANVAS_CLIENT_ID')}`,
    );
    this.logger.log(
      `🔧 Initializing LTI with canvas authentication endpoint: ${this.configService.get<string>('CANVAS_URL')}/api/lti/authorize_redirect`,
    );
    this.logger.log(
      `🔧 Initializing LTI with canvas accesstoken endpoint: ${this.configService.get<string>('CANVAS_URL')}/login/oauth2/token`,
    );
    this.logger.log(
      `🔧 Initializing LTI with canvas auth config: ${this.configService.get<string>('CANVAS_URL')}/api/lti/security/jwks`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    Provider.setup(
      this.configService.get<string>('LTI_KEY') || '',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { plugin: db },
      {
        appUrl: this.configService.get<string>('APP_URL') || '',
        loginUrl: '/login',
        cookies: {
          secure: this.configService.get<string>('NODE_ENV') !== 'local',
          sameSite: 'None',
        },
        devMode: this.configService.get<string>('NODE_ENV') === 'local',
        tokenMaxAge: 300,
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    Provider.onConnect(
      (token: any, req: Request, res: Response) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.log('🔑 LTI Launch successful: ' + token.user);
        return res.send('LTI Connection Successful!');
      },
      {
        invalidToken: (req: Request, res: Response): void => {
          this.logger.warn('❌ expired token');
          res.redirect(
            this.configService.get<string>('APP_TIMEOUT_URL') || '/',
          );
        },
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    await Provider.deploy({ server, serverless: true } as any);
    this.logger.log('🚀 LTI deployed');

    const canvasConfig = getCanvasPlatformConfig(this.configService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await Provider.registerPlatform(canvasConfig);

    this.logger.log('📝 Platform registered with Canvas');
  }

  getLtiApp() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return Provider.app;
  }
}
