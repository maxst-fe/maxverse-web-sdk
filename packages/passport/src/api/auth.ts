/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogoutBody, TokenBody } from '../worker/worker.types';
import { HttpClient, Options } from './index';

export class AuthClient extends HttpClient {
  constructor(options: Options) {
    super(options);
  }

  postAccessToken(params: string): Promise<TokenBody> {
    try {
      return this.post('public/oauth/token', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  postRefreshToken(params: string): Promise<TokenBody> {
    try {
      return this.post('public/oauth/token/refresh', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  postLogout(params: string): Promise<LogoutBody> {
    try {
      return this.post('passport/logout', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
