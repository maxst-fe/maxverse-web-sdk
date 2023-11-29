import { ALLOWED_AUTH_PARAMS, CODE_CHALLENGE_METHOD, DEFAULT_REDIRECT_URI } from '../../constants';
import {
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
  loginOptions: { client_id: string | undefined; authorizationOptions: Partial<AuthorizationOptions> },
  code_challenge: string
) => {
  const { client_id, authorizationOptions } = loginOptions;

  return {
    client_id: client_id ?? initialOptions.clientId,
    response_type: authorizationOptions.response_type ?? initialOptions.authorizationOptions.response_type,
    scope: authorizationOptions.scope
      ? getUniqueScopes('openid', authorizationOptions.scope)
      : initialOptions.authorizationOptions.scope,
    redirect_uri: authorizationOptions.redirect_uri ?? initialOptions.authorizationOptions.redirect_uri,
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

/**
 * @description
 * Including the ui_locales value in the redirect URI for the OAuth 2.0 authorization code request does not adhere to the standard OAuth 2.0 specification.
 * However, Passport authentication service currently includes a feature that allows users to change their language settings during the authentication process(in login page). Therefore, the passport package of client application needs to incorporate related functionality accordingly.
 * To resolve this, the Passport client does not directly reference specific query parameter values that are received additionally. Instead, it passes all optional fields when the `keepOptionalAuthParams` option is set to true.
 * https://github.com/maxverse-dev/maxverse-web-sdk/issues/187
 */
export const parseAuthenticationResult = (queryString: string, keepOptionalAuthParams: string[]) => {
  const searchParams = new URLSearchParams(queryString);

  const allowedAuthParams = [...new Set([...keepOptionalAuthParams, ...ALLOWED_AUTH_PARAMS])];
  const authResult: { [key: string]: string } = {};

  for (const [key, val] of searchParams) {
    if (allowedAuthParams.includes(key)) {
      authResult[key] = val;
    }

    return authResult;
  }

  return {};
};

export const composeUrl = (domain: string, req: string, params: string) => {
  return `${domain}/passport/${req}?${params}`;
};

export const nowTime = () => new Date().getTime();
