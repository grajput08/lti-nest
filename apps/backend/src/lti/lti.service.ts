import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Provider } from 'ltijs';
import { Application } from 'express';
import { LtiDatabaseService } from './lti-database.service';
import { getCanvasPlatformConfig } from './canvas.config';
import {
  IdToken,
  LtiProvider,
  LtiSetupOptions,
  LtiDeployOptions,
  LtiDeployConfig,
} from './types/ltijs.types';

@Injectable()
export class LtiService {
  private readonly logger = new Logger(LtiService.name);
  private ltiProvider: LtiProvider;

  constructor(
    private configService: ConfigService,
    private ltiDatabaseService: LtiDatabaseService,
  ) {
    this.ltiProvider = Provider as unknown as LtiProvider;
  }

  async initialize(server: unknown): Promise<void> {
    const db = this.ltiDatabaseService.createDatabasePlugin();
    const ltiKey = this.configService.get<string>('LTI_KEY') || '';
    const appUrl = this.configService.get<string>('APP_URL') || '';
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'local';
    const isLocal = nodeEnv === 'local';

    this.logger.log(`Initializing LTI with key: ${ltiKey}`);
    this.logger.log(`App URL: ${appUrl}`);
    this.logger.log(`Dev mode: ${isLocal}`);

    const setupOptions: LtiSetupOptions = { plugin: db };
    const deployOptions: LtiDeployOptions = {
      appUrl,
      loginUrl: '/login',
      cookies: {
        secure: !isLocal,
        sameSite: isLocal ? '' : 'None',
      },
      devMode: isLocal,
      tokenMaxAge: 300,
    };

    await this.ltiProvider.setup(ltiKey, setupOptions, deployOptions);

    this.ltiProvider.onConnect(
      (token: IdToken, req, res) => {
        this.logger.log(`LTI Launch successful for user: ${token.user || token.sub}`);
        res.send('LTI Connection Successful!');
      },
      {
        invalidToken: (req, res): void => {
          this.logger.warn('Invalid or expired token');
          const timeoutUrl = this.configService.get<string>('APP_TIMEOUT_URL') || '/';
          res.redirect(timeoutUrl);
        },
      },
    );

    const deployConfig: LtiDeployConfig = {
      server,
      serverless: true,
    };
    await this.ltiProvider.deploy(deployConfig);
    this.logger.log('LTI deployed successfully');

    const canvasConfig = getCanvasPlatformConfig(this.configService);
    await this.ltiProvider.registerPlatform(canvasConfig);

    this.logger.log('Platform registered with Canvas');
  }

  getLtiApp(): Application {
    return this.ltiProvider.app;
  }
}
