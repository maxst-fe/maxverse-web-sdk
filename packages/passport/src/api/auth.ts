/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogoutBody, TokenFetchResult } from '../api/types';
import { HttpClient, Options } from './index';

export class AuthClient extends HttpClient {
  constructor(options: Options) {
    super(options);
  }

  postToken(params: string): Promise<TokenFetchResult> {
    try {
      return this.post('token', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  postLogout(params: string): Promise<LogoutBody> {
    try {
      return this.post('connect/logout', { body: params });
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
