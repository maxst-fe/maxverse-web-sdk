export type OnLoad = 'check-sso' | 'login-required';

export type AuthenticationError = 'access_denied' | 'invalid_scope' | null;

export type AuthRequest = 'check_refresh_token' | 'token' | 'refresh_token' | 'logout';

export interface CommonOption {
  redirect_uri: string;
}

export interface AuthorizationOptions extends CommonOption {
  response_type: 'code';
  scope: string;
  ui_locales: 'ko' | 'en';
}

export interface AccessTokenOptions extends CommonOption {
  grant_type: 'authorization_code';
  code: string;
  code_verifier: string;
}

export interface RefreshTokenOptions {
  client_id: string;
  grant_type: 'refresh_token';
}

export interface PassportClientOptions {
  domain: string;
  clientId: string;
  cookieDomain?: string;
  authorizationOptions?: Partial<AuthorizationOptions>;
}

export interface Transaction {
  code_verifier: string;
}

export interface EntireAuthorizationOptions extends AuthorizationOptions {
  client_id: string;
  code_challenge: string;
  code_challenge_method: string;
}

export interface EntireAccessTokenOptions extends AccessTokenOptions {
  client_id: string;
}

export interface LogoutOptions {
  client_id: string;
  refresh_token: string;
  id_token: string;
}

export interface AuthenticationResult {
  state: string | null;
  session_state: string | null;
  code: string | null;
  error: AuthenticationError;
}

export interface Idtoken {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  nonce: string;
  session_state: string;
  at_hash: string;
  acr: string;
  sid: string;
  image: string;
  biz: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}
