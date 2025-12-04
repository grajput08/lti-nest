import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LtiService } from './lti/lti.service';
import { json, urlencoded } from 'express';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser - we'll configure it manually
  });

  // Helper function to check if route should skip body parsing (LTI routes)
  const shouldSkipBodyParsing = (path: string): boolean => {
    return (
      path === '/' ||
      path === '/login' ||
      path.startsWith('/lti') ||
      path.startsWith('/platforms')
    );
  };

  // Apply JSON body parser only for non-LTI routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (shouldSkipBodyParsing(req.path)) {
      return next();
    }
    return json()(req, res, next);
  });

  // Apply URL-encoded body parser only for non-LTI routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (shouldSkipBodyParsing(req.path)) {
      return next();
    }
    return urlencoded({ extended: true })(req, res, next);
  });

  const server = app.getHttpServer();

  const ltiService = app.get(LtiService);
  await ltiService.deploy(server);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
