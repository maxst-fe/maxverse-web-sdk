import { CODE_CHALLENGE_METHOD, DEFAULT_REDIRECT_URI } from '../../constants';
import {
  AuthenticationError,
  AuthenticationResult,
  AuthorizationOptions,
  EntireAccessTokenOptions,
  EntireAuthorizationOptions,
  LogoutOptions,
  PassportClientOptions,
  RefreshTokenOptions,
} from '../../types';
import { peelUndefinedInObj } from '../../utils/index';

export const getUniqueScopes = (...scopes: Array<string | undefined>) => {
  return scopes.filter(Boolean).join(' ').trim().split(/\s+/).join(' ');
};

export const isServer = () => {
  return typeof window === 'undefined';
};

export const getAuthorizationOptions = (
  initialOptions: Pick<PassportClientOptions, 'clientId'> & {
    authorizationOptions: AuthorizationOptions;
  },
  loginOptions: Partial<AuthorizationOptions>,
  scope: string,
  code_challenge: string
) => {
  return {
    client_id: initialOptions.clientId,
    response_type: loginOptions.response_type || initialOptions.authorizationOptions.response_type,
    scope,
    redirect_uri: loginOptions.redirect_uri || initialOptions.authorizationOptions.redirect_uri,
    code_challenge,
    code_challenge_method: CODE_CHALLENGE_METHOD,
    ui_locales: initialOptions.authorizationOptions.ui_locales,
  };
};

export const checkIsRedirectUriNotSet = (initialRedirectUri: string) => {
  return initialRedirectUri === DEFAULT_REDIRECT_URI;
};

export const getDomain = (originUrl: string) => {
  const httpOrHttpsProtocolPattern = /^https?:\/\//;
  const trailingSlashPattern = /\/$/;

  if (!httpOrHttpsProtocolPattern.test(originUrl)) {
    originUrl = `https://${originUrl}`;
  }

  if (trailingSlashPattern.test(originUrl)) {
    originUrl = originUrl.replace(trailingSlashPattern, '');
  }

  return originUrl;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const buildQueryParams = ({
  client_id,
  ...params
}: EntireAuthorizationOptions | EntireAccessTokenOptions | RefreshTokenOptions | LogoutOptions) => {
  return Object.entries<string>(peelUndefinedInObj({ client_id, ...params }))
    .map(([k, v]) => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(v);
    })
    .join('&');
};

export const parseAuthenticationResult = (queryString: string): AuthenticationResult => {
  const searchParams = new URLSearchParams(queryString);

  return {
    state: searchParams.get('state'),
    session_state: searchParams.get('session_state'),
    code: searchParams.get('code'),
    error: searchParams.get('error') as AuthenticationError,
  };
};

export const composeUrl = (domain: string, req: string, params: string) => {
  return `${domain}/passport/${req}?${params}`;
};

export const nowTime = () => new Date().getTime();
