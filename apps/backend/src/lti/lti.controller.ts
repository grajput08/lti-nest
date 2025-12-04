import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LtiService } from './lti.service';

@Controller()
export class LtiController {
  constructor(private readonly ltiService: LtiService) {}

  @All('*')
  handleLtiRoutes(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const app = this.ltiService.getLtiApp();
    if (app) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return app(req, res, () => {
        // Next function for Express middleware
      });
    }
    return res.status(503).send('LTI not initialized');
  }
}
