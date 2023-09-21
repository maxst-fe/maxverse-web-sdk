import { AuthRequest } from '../api/types';

export type Identifier = 'refresh_token' | 'refresh_expires_in';

export interface Message {
  baseUrl: string;
  params: string;
  req: AuthRequest;
  headers?: { [key: string]: string };
}
