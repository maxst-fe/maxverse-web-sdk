/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { checkRefreshToken, deprecateSession, oauthToken } from './api/auth-middleware';
import { DEFAULT_REDIRECT_URI, DEFAULT_RESPONSE_TYPE, UI_LOCALES_KO } from './constants';
import {
  AUTHENTICATION_ACCESS_DENIED,
  AUTHENTICATION_INVALID_SCOPE,
  INVALID_ACCESS_SELF_INSTANCE_ERROR,
  INVALID_ACCESS_SERVER_ENV_ERROR,
  INVALID_WEB_WORKER_INSTANCE,
  NOT_FOUND_ID_TOKEN,
  NOT_FOUND_QUERY_PARAMS_ERROR,
  NOT_FOUND_REFRESH_TOKEN,
  NOT_FOUND_REFRESH_TOKEN_EXPIRES,
  NOT_FOUND_VALID_CLIENT_ID,
  NOT_FOUND_VALID_CODE_VERIFIER,
  NOT_FOUND_VALID_DOMAIN,
  NOT_FOUND_VALID_TRANSACTION,
} from './constants/error';
import { CacheCookieManager } from './helpers/cache';
import {
  buildQueryParams,
  checkIsRedirectUriNotSet,
  composeUrl,
  getAuthorizationOptions,
  getDomain,
  getUniqueScopes,
  isServer,
  parseAuthenticationResult,
} from './helpers/common';
import { decode } from './helpers/jwt';
import { bufferToBase64UrlEncoded, createRandomString, sha256 } from './helpers/pkce';
import { TransactionManager } from './helpers/transaction';
import {
  AuthorizationOptions,
  AuthRequest,
  EntireAccessTokenOptions,
  EntireAuthorizationOptions,
  Idtoken,
  OnLoad,
  PassportClientOptions,
  RefreshTokenOptions,
} from './types';
import { CookieStorage, SessionStorage } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AuthWorker from 'shared-worker:./worker/auth.worker.ts';

export const PassportFactory = ({ domain, clientId }: Pick<PassportClientOptions, 'domain' | 'clientId'>) => {
  return new Passport({ domain, clientId });
};

export class Passport {
  readonly #defaultOptions: {
    onLoad: OnLoad;
    authorizationOptions: Omit<AuthorizationOptions, 'scope'>;
  } = {
    onLoad: 'check-sso',
    authorizationOptions: {
      response_type: DEFAULT_RESPONSE_TYPE,
      redirect_uri: DEFAULT_REDIRECT_URI,
      ui_locales: UI_LOCALES_KO,
    },
  };
  readonly #authUrl: string;
  readonly #options: PassportClientOptions & {
    authorizationOptions: AuthorizationOptions;
  };
  readonly #scope: string;
  readonly #cacheCookieManager: CacheCookieManager;
  readonly #transactionManager: TransactionManager;
  readonly #authWorker?: SharedWorker;

  constructor(options: PassportClientOptions) {
    if (!(this instanceof Passport)) {
      throw new Error(INVALID_ACCESS_SELF_INSTANCE_ERROR);
    }

    if (!options.domain) {
      throw new Error(NOT_FOUND_VALID_DOMAIN);
    }

    if (!options.clientId) {
      throw new Error(NOT_FOUND_VALID_CLIENT_ID);
    }

    if (isServer()) {
      throw new Error(INVALID_ACCESS_SERVER_ENV_ERROR);
    }

    this.#scope = getUniqueScopes('openid', options?.authorizationOptions?.scope);

    this.#options = {
      ...options,
      authorizationOptions: {
        ...this.#defaultOptions.authorizationOptions,
        ...options.authorizationOptions,
        scope: this.#scope,
      },
    };

    const cookieStorage = new CookieStorage();
    const sessionStorage = new SessionStorage();

    this.#cacheCookieManager = new CacheCookieManager(
      cookieStorage,
      this.#options.clientId,
      this.#options.cookieDomain
    );
    this.#transactionManager = new TransactionManager(sessionStorage, this.#options.clientId);

    const baseDomain = getDomain(options.domain);

    this.#authUrl = `${baseDomain}`;

    if (window.SharedWorker) {
      this.#authWorker = new AuthWorker();
    }
  }

  public get isAuthenticated() {
    return Boolean(this.#cacheCookieManager.get('token')) && Boolean(this.#cacheCookieManager.get('id_token'));
  }

  public get isAuthorizationCodeFlow() {
    const transaction = this.#transactionManager.get();

    return Boolean(transaction?.code_verifier);
  }

  public get claims() {
    const id_token = this.#idToken;

    if (!id_token) {
      throw new Error(NOT_FOUND_ID_TOKEN);
    }

    return decode<Idtoken>(id_token);
  }

  get #idToken() {
    return this.#cacheCookieManager.get('id_token');
  }

  get #accessToken() {
    return this.#cacheCookieManager.get('token');
  }

  #getUrl<T extends EntireAuthorizationOptions | EntireAccessTokenOptions>(req: string, options: T) {
    const params = buildQueryParams(options);
    return composeUrl(this.#authUrl, req, params);
  }

  async #prebuildAuthorizationUrl(loginOptions: Partial<AuthorizationOptions>) {
    const code_verifier = createRandomString();
    const code_challenge_digested = await sha256(code_verifier);
    const code_challenge = bufferToBase64UrlEncoded(code_challenge_digested);

    const initialOptions = {
      clientId: this.#options.clientId,
      authorizationOptions: this.#options.authorizationOptions,
    };

    const options = getAuthorizationOptions(initialOptions, loginOptions, this.#scope, code_challenge);
    const url = this.#getUrl('authorize', options);

    return {
      url,
      code_verifier,
    };
  }

  async #requestToken(options: EntireAccessTokenOptions | RefreshTokenOptions, req: AuthRequest) {
    if (!(this.#authWorker instanceof SharedWorker)) {
      throw new Error(INVALID_WEB_WORKER_INSTANCE);
    }

    try {
      const authResult = await oauthToken(this.#authUrl, options, req, this.#authWorker);

      this.#cacheCookieManager.save('token', authResult.token, authResult.expires_in);
      this.#cacheCookieManager.save('id_token', authResult.id_token, authResult.expires_in);

      const decoded = decode<Idtoken>(authResult.id_token);

      return {
        token: authResult.token,
        id_token: authResult.id_token,
        claims: decoded,
      };
    } catch (error) {
      throw error;
    }
  }

  #initializeTransaction() {
    this.#transactionManager.remove();
  }

  #replaceHref() {
    const transactionUrl = window.location.href;

    const [originUrl] = transactionUrl.split('?');

    window.history.replaceState({}, '', originUrl);
  }

  async #checkIsEnableTokenRotation() {
    if (!(this.#authWorker instanceof SharedWorker)) {
      throw new Error(INVALID_WEB_WORKER_INSTANCE);
    }

    try {
      const has_refresh_token = await checkRefreshToken('check_refresh_token', this.#authWorker);

      return has_refresh_token;
    } catch (error) {
      throw error;
    }
  }

  public async onLoad(onLoad: OnLoad) {
    onLoad = onLoad || this.#defaultOptions.onLoad;

    try {
      if (this.isAuthorizationCodeFlow) {
        const claims = await this.onRedirectPage();

        return claims;
      }

      const token_rotation = await this.#checkIsEnableTokenRotation();

      if (token_rotation && this.isAuthenticated) {
        return this.claims;
      }

      return null;
    } catch (error: any) {
      const refresh_token_error = error === NOT_FOUND_REFRESH_TOKEN_EXPIRES || error === NOT_FOUND_REFRESH_TOKEN;

      if (refresh_token_error) {
        this.#cacheCookieManager.clearAll();

        if (onLoad === 'check-sso') {
          this.loginWithRedirect();
        }
      }

      throw error;
    }
  }

  public async loginWithRedirect(options: Partial<AuthorizationOptions> = {}) {
    if (checkIsRedirectUriNotSet(this.#options.authorizationOptions?.redirect_uri, options.redirect_uri)) {
      options.redirect_uri = window.location.href;
    }

    const transaction = this.#transactionManager.get();

    if (transaction) {
      this.#initializeTransaction();
    }

    const { url, code_verifier } = await this.#prebuildAuthorizationUrl(options);

    this.#transactionManager.create({
      code_verifier,
    });

    window.location.assign(url);
  }

  public async onRedirectPage(url: string = window.location.href) {
    const [baseUrl, queryString] = url.split('?');

    if (queryString.length === 0) {
      throw new Error(NOT_FOUND_QUERY_PARAMS_ERROR);
    }

    const { code, error } = parseAuthenticationResult(queryString);

    const transaction = this.#transactionManager.get();

    if (!transaction) {
      throw new Error(NOT_FOUND_VALID_TRANSACTION);
    }

    if (error === 'access_denied') {
      throw new Error(AUTHENTICATION_ACCESS_DENIED);
    }
    if (error === 'invalid_scope') {
      throw new Error(AUTHENTICATION_INVALID_SCOPE);
    }

    if (!transaction.code_verifier) {
      throw new Error(NOT_FOUND_VALID_CODE_VERIFIER);
    }

    const verifiedCode = code as string;

    const options: EntireAccessTokenOptions = {
      client_id: this.#options.clientId,
      grant_type: 'authorization_code',
      code: verifiedCode,
      redirect_uri: baseUrl,
      code_verifier: transaction.code_verifier,
    };

    try {
      const { claims } = await this.#requestToken(options, 'token');

      return claims;
    } catch (error: any) {
      throw error;
    } finally {
      this.#initializeTransaction();
      this.#replaceHref();
    }
  }

  public async updateToken() {
    try {
      if (this.isAuthenticated) {
        const token = this.#accessToken as string;
        const id_token = this.#idToken as string;

        return { token, id_token };
      }

      await this.#checkIsEnableTokenRotation();

      const { token, id_token } = await this.#requestToken(
        {
          client_id: this.#options.clientId,
          grant_type: 'refresh_token',
        },
        'refresh_token'
      );

      return { token, id_token };
    } catch (error: any) {
      throw error;
    }
  }

  public async requestLogout() {
    try {
      const { token, id_token } = await this.updateToken();

      if (!(this.#authWorker instanceof SharedWorker)) {
        throw new Error(INVALID_WEB_WORKER_INSTANCE);
      }

      const res = await deprecateSession(
        this.#authUrl,
        { client_id: this.#options.clientId, id_token },
        'logout',
        this.#authWorker,
        { Authorization: `Bearer ${token}` }
      );

      if (res === 'SUCCESS') {
        this.#cacheCookieManager.clearAll();
      }

      return res;
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
