export const getCanvasPlatformConfig = () => ({
  url: 'https://canvas.instructure.com',
  name: 'Canvas LMS',
  clientId: process.env.CLIENT_ID,
  authenticationEndpoint: `${process.env.CANVAS_URL}/api/lti/authorize_redirect`,
  accesstokenEndpoint: `${process.env.CANVAS_URL}/login/oauth2/token`,
  authConfig: {
    method: 'JWK_SET',
    key: `${process.env.CANVAS_URL}/api/lti/security/jwks`,
  },
});
