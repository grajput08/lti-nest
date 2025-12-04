import { Request, Response, NextFunction, Application } from 'express';

export interface IdToken {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  iat: number;
  azp?: string;
  nonce?: string;
  name?: string;
  email?: string;
  user?: string;
  [key: string]: unknown;
}

export interface PlatformConfig {
  url: string;
  name: string;
  clientId: string;
  authenticationEndpoint: string;
  accesstokenEndpoint: string;
  authConfig: {
    method: 'JWK_SET' | 'JWK_KEY' | 'RSA_KEY';
    key: string;
  };
}

export interface LtiSetupOptions {
  plugin?: unknown;
}

export interface LtiDeployOptions {
  appUrl: string;
  loginUrl: string;
  cookies: {
    secure: boolean;
    sameSite: '' | 'None' | 'Lax' | 'Strict';
  };
  devMode: boolean;
  tokenMaxAge?: number;
}

export interface LtiDeployConfig {
  server?: unknown;
  serverless?: boolean;
}

export interface OnConnectCallbackOptions {
  invalidToken?: (req: Request, res: Response) => void;
}

export type OnConnectCallback = (
  token: IdToken,
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export interface LtiProvider {
  setup(
    encryptionKey: string,
    setupOptions: LtiSetupOptions,
    deployOptions: LtiDeployOptions,
  ): Promise<void>;
  deploy(config: LtiDeployConfig): Promise<void>;
  registerPlatform(config: PlatformConfig): Promise<void>;
  onConnect(
    callback: OnConnectCallback,
    options?: OnConnectCallbackOptions,
  ): void;
  app: Application;
}
