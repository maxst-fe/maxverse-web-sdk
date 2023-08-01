import { AuthRequest, RequestTokenResult } from '../types';

export type Identifier = 'refresh_token' | 'refresh_expires_in';

export interface Message {
  baseUrl: string;
  params: string;
  req: AuthRequest;
}

export interface Reply<T extends RequestTokenResult | string> {
  status: string;
  json: T;
}
