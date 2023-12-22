/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import { checkRefreshTokenActive, oauthFetch } from './api/auth-middleware';
import { AuthRequest, Reply, TokenBody } from './api/types';
import {
  ALLOWED_DOMAINS,
  CACHE_LOCATION_COOKIE,
  DEFAULT_REDIRECT_URI,
  DEFAULT_RESPONSE_TYPE,
  UI_LOCALES_KO,
} from './constants';
import {
  AUTHENTICATION_ACCESS_DENIED,
  AUTHENTICATION_INVALID_SCOPE,
  AUTHORIZATION_CODE_FLOW,
  INVALID_ACCESS_SELF_INSTANCE_ERROR,
  INVALID_ACCESS_SERVER_ENV_ERROR,
  INVALID_AUTHORIZATION_CODE_FLOW,
  INVALID_AUTH_SERVER_DOMAIN,
  INVALID_CACHE_LOCATION,
  NOT_FOUND_VALID_CLIENT_ID,
  NOT_FOUND_VALID_CODE_VERIFIER,
  NOT_FOUND_VALID_DOMAIN,
  NOT_FOUND_VALID_TRANSACTION,
} from './constants/error';
import { AuthenticationError } from './errors';
import { cacheFactory } from './helpers/cache';
import {
  buildQueryParams,
  checkIsRedirectUriNotSet,
  composeUrl,
  filterTokenByThread,
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
  CacheLocation,
  Claims,
  EntireAccessTokenOptions,
  EntireAuthorizationOptions,
  OnLoad,
  PassportClientOptions,
  RefreshTokenOptions,
} from './types';
import { SessionStorage } from './utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AuthWorker from 'shared-worker:./worker/auth.worker.ts';
import { CacheManager } from './helpers/cache/cache-manager';

export const PassportFactory = ({ domain, clientId }: Pick<PassportClientOptions, 'domain' | 'clientId'>) => {
  return new Passport({ domain, clientId });
};

export class Passport {
  readonly #defaultOptions: {
    authorizationOptions: Omit<AuthorizationOptions, 'scope'>;
  } = {
    authorizationOptions: {
      response_type: DEFAULT_RESPONSE_TYPE,
      redirect_uri: DEFAULT_REDIRECT_URI,
      ui_locales: UI_LOCALES_KO,
    },
  };
  readonly #authUrl: string;
  readonly #options: PassportClientOptions & { onLoad: OnLoad; keepOptionalAuthParams: string[] } & {
    authorizationOptions: AuthorizationOptions;
  };
  readonly #scope: string;
  readonly #cacheManager: CacheManager;
  readonly #transactionManager: TransactionManager;
  readonly #authWorker?: SharedWorker;

  constructor(options: PassportClientOptions & { onLoad?: OnLoad; keepOptionalAuthParams?: string[] }) {
    if (!(this instanceof Passport)) {
      throw new Error(INVALID_ACCESS_SELF_INSTANCE_ERROR);
    }

    if (!options.domain) {
      throw new Error(NOT_FOUND_VALID_DOMAIN);
    }

    if (!ALLOWED_DOMAINS.includes(options.domain)) {
      throw new Error(INVALID_AUTH_SERVER_DOMAIN);
    }

    if (!options.clientId) {
      throw new Error(NOT_FOUND_VALID_CLIENT_ID);
    }

    if (isServer()) {
      throw new Error(INVALID_ACCESS_SERVER_ENV_ERROR);
    }

    this.#scope = getUniqueScopes('openid', options?.authorizationOptions?.scope);

    let redirect_uri =
      options.authorizationOptions?.redirect_uri ?? this.#defaultOptions.authorizationOptions.redirect_uri;

    if (redirect_uri?.includes('?code')) {
      redirect_uri = redirect_uri.split('?code')[0];
    }

    const onLoad = options.onLoad ?? 'check-sso';
    const useWorker = options.useWorker ?? false;
    const keepOptionalAuthParams = options.keepOptionalAuthParams ?? [];

    this.#options = {
      ...options,
      useWorker,
      onLoad,
      keepOptionalAuthParams,
      authorizationOptions: {
        ...this.#defaultOptions.authorizationOptions,
        ...options.authorizationOptions,
        redirect_uri,
        scope: this.#scope,
      },
    };

    const cacheLocation: CacheLocation = options.cacheLocation || CACHE_LOCATION_COOKIE;

    if (!cacheFactory(cacheLocation)) {
      throw new Error(`${INVALID_CACHE_LOCATION}: ${cacheLocation}`);
    }

    const cache = cacheFactory(cacheLocation)();

    const sessionStorage = new SessionStorage();

    this.#cacheManager = new CacheManager(cache, this.#options.clientId, this.#options.cookieDomain);
    this.#transactionManager = new TransactionManager(sessionStorage, this.#options.clientId);

    const baseDomain = getDomain(options.domain);

    this.#authUrl = `${baseDomain}`;

    if (window.SharedWorker && useWorker) {
      this.#authWorker = new AuthWorker();
    }
  }

  public get isAuthenticated() {
    const id_token_entry = this.#cacheManager.getIdToken();
    const auth_entry = this.#cacheManager.get();

    return Boolean(id_token_entry?.id_token) && Boolean(auth_entry?.token);
  }

  public get isAuthorizationCodeFlow() {
    const transaction = this.#transactionManager.get();

    return Boolean(transaction?.code_verifier);
  }

  public get claims() {
    const id_token_entry = this.#cacheManager.getIdToken();

    return id_token_entry?.claims;
  }

  public get idToken() {
    const id_token_entry = this.#cacheManager.getIdToken();

    return id_token_entry?.id_token;
  }

  public get accessToken() {
    const auth_entry = this.#cacheManager.get();

    return auth_entry?.token;
  }

  get #supportAuthWorker() {
    return Boolean(this.#authWorker) && this.#options.useWorker;
  }

  #getUrl<T extends EntireAuthorizationOptions | EntireAccessTokenOptions>(req: string, options: T) {
    const params = buildQueryParams(options);
    return composeUrl(this.#authUrl, req, params);
  }

  async #prebuildAuthorizationUrl(loginOptions: {
    client_id: string | undefined;
    authorizationOptions: Partial<AuthorizationOptions>;
  }) {
    const code_verifier = createRandomString();
    const code_challenge_digested = await sha256(code_verifier);
    const code_challenge = bufferToBase64UrlEncoded(code_challenge_digested);

    const initialOptions = {
      clientId: this.#options.clientId,
      authorizationOptions: this.#options.authorizationOptions,
    };

    const options = getAuthorizationOptions(initialOptions, loginOptions, code_challenge);
    const url = this.#getUrl('authorize', options);

    return {
      url,
      code_verifier,
    };
  }

  async #requestToken(options: EntireAccessTokenOptions | RefreshTokenOptions, req: AuthRequest) {
    try {
      const { body } = await oauthFetch<Reply<TokenBody>>(this.#authUrl, options, req, this.#authWorker);

      const { refresh_token, refresh_expires_in, id_token, ...entry } = body;

      this.#cacheManager.remove();

      if (refresh_token && refresh_expires_in) {
        this.#cacheManager.setRefreshToken(refresh_token, refresh_expires_in);
      }

      let claims = this.claims;

      if (id_token) {
        claims = decode<Claims>(id_token);
        this.#cacheManager.setIdToken(id_token, claims);
      }

      this.#cacheManager.set(entry);

      return {
        token: entry.access_token,
        id_token,
        claims,
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

  async #reconcileAuthorizationCodeFlow(onLoad: OnLoad) {
    try {
      this.#initializeTransaction();

      if (onLoad === 'check-sso') {
        this.#cacheManager.remove();
        await this.loginWithRedirect();
      }

      if (onLoad === 'login-required') {
        const id_token = this.idToken;

        if (!id_token) {
          this.#cacheManager.remove();
          return;
        }

        this.#cacheManager.remove();

        await this.loginWithRedirect();
      }
    } catch (error: any) {
      throw error;
    }
  }

  public async checkRefreshTokenRotation() {
    try {
      if (this.#supportAuthWorker) {
        const active_refresh_token = await checkRefreshTokenActive(
          'check_refresh_token_active',
          this.#authWorker as SharedWorker
        );
        return active_refresh_token;
      }

      const cache_refresh_token = this.#cacheManager.getRefreshToken();

      return cache_refresh_token;
    } catch (error: any) {
      throw error;
    }
  }

  public async onLoad(onLoad?: OnLoad) {
    onLoad = onLoad ?? this.#options.onLoad;

    try {
      if (this.isAuthorizationCodeFlow) {
        const res = await this.onRedirectPage();

        return res;
      }

      await this.checkRefreshTokenRotation();

      if (this.isAuthenticated) {
        return { claims: this.claims };
      }

      return null;
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        await this.#reconcileAuthorizationCodeFlow(onLoad);
      }

      throw error;
    }
  }

  public async loginWithRedirect(
    loginOptions: Partial<Pick<PassportClientOptions, 'clientId' | 'authorizationOptions'>> = {}
  ) {
    const { authorizationOptions, clientId } = loginOptions;

    const options: Partial<AuthorizationOptions> = authorizationOptions ?? {};

    if (checkIsRedirectUriNotSet(this.#options.authorizationOptions?.redirect_uri) && !options?.redirect_uri) {
      let redirect_uri = window.location.href.toString();

      if (redirect_uri.includes('?code')) {
        redirect_uri = redirect_uri.split('?code')[0];
      }

      options.redirect_uri = redirect_uri;
    }

    const transaction = this.#transactionManager.get();

    if (transaction) {
      this.#initializeTransaction();
    }

    const { url, code_verifier } = await this.#prebuildAuthorizationUrl({
      authorizationOptions: options,
      client_id: clientId,
    });

    this.#transactionManager.create({
      code_verifier,
    });

    window.location.replace(url);
  }

  public async onRedirectPage(url: string = window.location.href) {
    const [baseUrl, queryString] = url.split('?');

    let redirect_uri: string = this.#options.authorizationOptions.redirect_uri;

    if (checkIsRedirectUriNotSet(this.#options.authorizationOptions?.redirect_uri)) {
      redirect_uri = baseUrl;
    }

    if (!queryString) {
      throw new AuthenticationError(INVALID_AUTHORIZATION_CODE_FLOW);
    }

    const { code, error, ...restParams } = parseAuthenticationResult(queryString, this.#options.keepOptionalAuthParams);

    if (!code) {
      throw new AuthenticationError(INVALID_AUTHORIZATION_CODE_FLOW);
    }

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
      redirect_uri,
      code_verifier: transaction.code_verifier,
    };

    try {
      const { claims } = await this.#requestToken(options, 'token');

      return { claims, ...restParams };
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
        const token = this.accessToken as string;
        const id_token = this.idToken as string;

        return { token, id_token };
      }

      if (this.isAuthorizationCodeFlow) {
        throw AUTHORIZATION_CODE_FLOW;
      }

      const cache_refresh_token = await this.checkRefreshTokenRotation();

      const refresh_token = filterTokenByThread(cache_refresh_token);

      const { token, id_token } = await this.#requestToken(
        {
          client_id: this.#options.clientId,
          grant_type: 'refresh_token',
          refresh_token,
        },
        'refresh_token'
      );

      return { token, id_token };
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        this.#reconcileAuthorizationCodeFlow(this.#options.onLoad);
      }

      throw error;
    }
  }

  public async requestLogout() {
    try {
      const { token, id_token } = await this.updateToken();

      const { status } = await oauthFetch<Reply<unknown>>(
        this.#authUrl,
        { client_id: this.#options.clientId, id_token_hint: id_token },
        'logout',
        this.#authWorker,
        { Authorization: `Bearer ${token}` }
      );

      if (status === 'SUCCESS') {
        this.#cacheManager.remove();
      }

      return status;
    } catch (error: any) {
      throw error;
    }
  }
}
