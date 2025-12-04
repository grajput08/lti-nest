import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LtiService } from './lti/lti.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpServer();
  const ltiService = app.get(LtiService);

  await ltiService.initialize(server);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
