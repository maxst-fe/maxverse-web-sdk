/* eslint-disable no-unused-vars */
import { Claims, OnLoad, Passport, PassportClientOptions } from '@maxverse/passport-web-sdk';

export interface PassportResult {
  status: 'SUCCESS' | 'FAIL';
  claims?: Claims;
  error?: string;
}

export interface PassportProviderProps {
  clientOptions: PassportClientOptions & { onLoad: OnLoad };
  onSuccess?: (result: PassportResult) => void;
  onError?: (result: PassportResult) => void;
}

export interface PassportClient {
  initialized: boolean;
  passport: Passport;
}
