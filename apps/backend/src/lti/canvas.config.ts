import { ConfigService } from '@nestjs/config';

export const getCanvasPlatformConfig = (configService: ConfigService) => ({
  url: 'https://canvas.instructure.com',
  name: 'Canvas LMS',
  clientId: configService.get<string>('CANVAS_CLIENT_ID'),
  authenticationEndpoint: `${configService.get<string>('CANVAS_URL')}/api/lti/authorize_redirect`,
  accesstokenEndpoint: `${configService.get<string>('CANVAS_URL')}/login/oauth2/token`,
  authConfig: {
    method: 'JWK_SET',
    key: `${configService.get<string>('CANVAS_URL')}/api/lti/security/jwks`,
  },
});
