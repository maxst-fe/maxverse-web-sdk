export type AuthRequest = 'check_refresh_token' | 'token' | 'refresh_token' | 'logout';

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

export interface Reply<T extends TokenBody | LogoutBody> {
  status: string;
  body: T;
}
