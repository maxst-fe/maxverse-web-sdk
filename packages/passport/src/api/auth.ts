/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogoutJson, TokenJson } from '../worker/worker.types';
import { HttpClient, Options } from './index';

export class AuthClient extends HttpClient {
  constructor(options: Options) {
    super(options);
  }

  postAccessToken(params: string): Promise<TokenJson> {
    try {
      return this.post('public/oauth/token', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  postRefreshToken(params: string): Promise<LogoutJson> {
    try {
      return this.post('public/oauth/token/refresh', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  postLogout(params: string) {
    try {
      return this.post('passport/logout', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
