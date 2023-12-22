interface CommonTokenResult {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export type AuthRequest = 'check_refresh_token_active' | 'token' | 'refresh_token' | 'logout';

export interface TokenFetchResult extends CommonTokenResult {
  refresh_token: string;
  refresh_expires_in: number;
}

export interface TokenBody extends CommonTokenResult {
  refresh_token?: string;
  refresh_expires_in?: number;
}

export type LogoutBody = unknown;

export type RefreshTokenAliveBody = string;

export interface Reply<T extends TokenBody | LogoutBody | RefreshTokenAliveBody> {
  status: string;
  body: T;
}
