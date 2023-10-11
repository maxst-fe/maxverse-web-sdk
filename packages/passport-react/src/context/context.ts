import { createContext } from 'react';
import { getPassportInstance } from './passport-instance';
import { PassportClient } from './types';

export const PassportContext = createContext<PassportClient>({
  initialized: false,
  setInitialized: null,
  isAuthenticated: false,
  passport: getPassportInstance(),
});

export const PassportContextConsumer = PassportContext.Consumer;
