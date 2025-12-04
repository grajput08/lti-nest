import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LtiService } from './lti.service';

@Injectable()
export class LtiMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LtiMiddleware.name);

  constructor(private readonly ltiService: LtiService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`🔥 LTI Middleware HIT → ${req.method} ${req.url}`);
    this.ltiService.use(req, res, next);
  }
}
