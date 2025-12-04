import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { LtiService } from './lti.service';

@Controller()
export class LtiController {
  constructor(private readonly ltiService: LtiService) {}

  @All('*')
  handleLtiRoutes(@Req() req: Request, @Res() res: Response): void {
    const app = this.ltiService.getLtiApp();
    if (app && typeof app === 'function') {
      const next: NextFunction = () => {
        res.status(404).send('Route not found');
      };
      app(req, res, next);
    } else {
      res.status(503).send('LTI not initialized');
    }
  }
}
