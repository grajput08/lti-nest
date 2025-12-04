import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LtiService } from './lti.service';

@Controller('lti')
export class LtiController {
  constructor(private readonly ltiService: LtiService) {}

  @Get('*')
  handleLtiRoutes(@Req() req: Request, @Res() res: Response) {
    const app = this.ltiService.getAppInstance() as
      | ((req: Request, res: Response) => void)
      | undefined;
    if (app) {
      return app(req, res);
    }
    return res.status(503).send('LTI not initialized');
  }
}
