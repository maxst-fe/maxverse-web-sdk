import { AuthRequest } from '../types';

export type Identifier = 'refresh_token' | 'refresh_expires_in';

export interface TokenJson {
  token: string;
  refresh_token: string;
  id_token: string;
  expires_in: string;
  refresh_expires_in: string;
  token_type: string;
  session_state: string;
  scope: string;
}

export type LogoutJson = string;

export interface CheckRfTokenJson {
  has_refresh_token: boolean;
}

export interface Message {
  baseUrl: string;
  params: string;
  req: AuthRequest;
  headers?: { [key: string]: string };
}

export interface Reply<T extends TokenJson | LogoutJson | CheckRfTokenJson> {
  status: string;
  json: T;
}
