import { AuthRequest } from '../types';

export type Identifier = 'refresh_token' | 'refresh_expires_in';

export interface TokenBody {
  token: string;
  refresh_token: string;
  id_token: string;
  expires_in: string;
  refresh_expires_in: string;
  token_type: string;
  session_state: string;
  scope: string;
}

export type LogoutBody = string;

export type CheckRfTokenBody = boolean;

export interface Message {
  baseUrl: string;
  params: string;
  req: AuthRequest;
  headers?: { [key: string]: string };
}

export interface Reply<T extends TokenBody | LogoutBody | CheckRfTokenBody> {
  status: string;
  body: T;
}
