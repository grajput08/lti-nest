import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LtiService } from './lti/lti.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  const server = app.getHttpServer();
  const configService = app.get(ConfigService);
  const ltiService = app.get(LtiService);

  await ltiService.initialize(server);

  const port = configService.get<number>('PORT') || 8080;
  await app.listen(port);

  logger.log(`Application is running on port ${port}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', error);
  process.exit(1);
});
