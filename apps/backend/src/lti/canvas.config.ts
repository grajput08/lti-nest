import { ConfigService } from '@nestjs/config';
import { PlatformConfig } from './types/ltijs.types';

export const getCanvasPlatformConfig = (
  configService: ConfigService,
): PlatformConfig => {
  const canvasUrl = configService.get<string>('CANVAS_URL') || 'https://canvas.instructure.com';
  const clientId = configService.get<string>('CANVAS_CLIENT_ID') || '';

  return {
    url: 'https://canvas.instructure.com',
    name: 'Canvas LMS',
    clientId,
    authenticationEndpoint: `${canvasUrl}/api/lti/authorize_redirect`,
    accesstokenEndpoint: `${canvasUrl}/login/oauth2/token`,
    authConfig: {
      method: 'JWK_SET',
      key: `${canvasUrl}/api/lti/security/jwks`,
    },
  };
};
