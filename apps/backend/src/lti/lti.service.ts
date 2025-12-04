import { Injectable, Logger } from '@nestjs/common';
import { DatabaseOptions, ProviderOptions } from 'ltijs';
import { Request, Response } from 'express';
import { LtiProvider } from './lti.provider';
import { getCanvasPlatformConfig } from './canvas.config';
import { LTIDatabaseService } from './lti-database.service';

@Injectable()
export class LtiService {
  private readonly logger = new Logger(LtiService.name);

  constructor(private ltiDatabase: LTIDatabaseService) {}

  private initializeDatabase() {
    return this.ltiDatabase;
  }

  private getLtiConfig(): {
    key: string;
    database: DatabaseOptions;
    options: ProviderOptions;
  } {
    return {
      key: process.env.LTI_KEY || '',
      database: {
        plugin: this.initializeDatabase(),
      },
      options: {
        appUrl: process.env.APP_URL,
        loginUrl: '/login',
        cookies: {
          secure: process.env.NODE_ENV !== 'local',
          sameSite: 'None',
        },
        devMode: process.env.NODE_ENV === 'local',
        tokenMaxAge: 300,
      },
    };
  }

  async initialize(server: any) {
    const config = this.getLtiConfig();

    this.logger.log('🔧 Initializing LTI');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    LtiProvider.setup(config.key, config.database, config.options);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    LtiProvider.onConnect(
      (token: any, req: Request, res: Response) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.log('🔑 LTI Launch successful: ' + token.user);
        return res.send('LTI Connection Successful!');
      },
      {
        invalidToken: (req: Request, res: Response): void => {
          this.logger.warn('❌ expired token');
          res.redirect(process.env.APP_TIMEOUT_URL || '/');
        },
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    await LtiProvider.deploy({ server, serverless: true } as any);
    this.logger.log('🚀 LTI deployed');

    const canvasConfig = getCanvasPlatformConfig();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await LtiProvider.registerPlatform(canvasConfig);

    this.logger.log('📝 Platform registered with Canvas');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return LtiProvider.app;
  }

  getAppInstance() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return LtiProvider.app;
  }
}
