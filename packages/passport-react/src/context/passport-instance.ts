/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { AuthorizationOptions, Passport, PassportClientOptions } from '@maxverse/passport-web-sdk';
import { isServer } from '../utils';

const staticPassportClient = {
  isMockInstance: true,
  isAuthenticated: false,
  isAuthorizationCodeFlow: false,
  claims: {},
  loginWithRedirect: (_options: Partial<AuthorizationOptions>) => Promise.resolve(false),
  onRedirectPage: (_url: string) => Promise.resolve(false),
  updateToken: () => Promise.resolve(false),
  requestLogout: () => Promise.resolve(false),
} as unknown as Passport;

export const getPassportInstance = (clientOptions?: PassportClientOptions) => {
  if (!clientOptions || isServer()) {
    return staticPassportClient;
  }

  return new Passport(clientOptions);
};
