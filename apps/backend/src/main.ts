import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LtiService } from './lti/lti.service';
import { json } from 'express';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser - we'll configure it manually
  });

  const server = app.getHttpServer();

  const ltiService = app.get(LtiService);
  await ltiService.deploy(server);

  // RAW BODY ONLY FOR LTI ROUTES (required for signature validation)
  app.use('/lti', json({ type: '*/*' }));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
