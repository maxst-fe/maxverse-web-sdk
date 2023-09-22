interface CommonTokenResult {
  token: string;
  id_token: string;
  expires_in: string;
  token_type: string;
  session_state: string;
  scope: string;
}

export type AuthRequest = 'check_refresh_token_alive' | 'token' | 'refresh_token' | 'logout';

export interface TokenFetchResult extends CommonTokenResult {
  refresh_token: string;
  refresh_expires_in: string;
}

export interface TokenBody extends CommonTokenResult {
  refresh_token?: string;
  refresh_expires_in?: string;
}

export type LogoutBody = string;

export type RefreshTokenAliveBody = boolean;

export interface Reply<T extends TokenBody | LogoutBody | RefreshTokenAliveBody> {
  status: string;
  body: T;
}
