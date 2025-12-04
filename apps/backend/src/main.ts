import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LtiService } from './lti/lti.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const server = app.getHttpServer();
  const configService = app.get(ConfigService);
  const ltiService = app.get(LtiService);

  await ltiService.initialize(server);

  await app.listen(configService.get<number>('PORT') || 8080);
}
bootstrap();
