/* eslint-disable no-unused-vars */
import { Claims, OnLoad, Passport, PassportClientOptions } from '@maxverse/passport-web-sdk';
import { Dispatch, SetStateAction } from 'react';

export type RegisterFunctionEntry = Array<(passport: Passport) => unknown>;

export interface PassportResult {
  status: 'SUCCESS' | 'FAIL';
  claims?: Claims;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalInfo?: { [key: string]: any };
}

export interface PassportProviderProps {
  clientOptions: PassportClientOptions & { onLoad?: OnLoad; keepOptionalAuthParams?: string[] };
  onSuccess?: (result: PassportResult) => void;
  onError?: (result: PassportResult) => void;
  registerContext?: RegisterFunctionEntry;
}

export interface PassportClient {
  initialized: boolean;
  setInitialized: Dispatch<SetStateAction<boolean>> | null;
  isAuthenticated: boolean;
  passport: Passport;
}
