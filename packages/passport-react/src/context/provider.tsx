/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Passport } from '@maxverse/passport-web-sdk';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { PassportContext } from './context';
import { getPassportInstance } from './passport-instance';
import { PassportProviderProps } from './types';

export function PassportProvider({
  clientOptions,
  onSuccess,
  onError,
  registerContext,
  children,
}: PropsWithChildren<PassportProviderProps>) {
  const [initialized, setInitialized] = useState(false);
  const [passport, setPassport] = useState(getPassportInstance());
  const [isAuthenticated, setAuthenticated] = useState(false);

  const { onLoad, authorizationOptions } = clientOptions;

  const init = useCallback(
    async (passport: Passport) => {
      try {
        const res = await passport.onLoad(onLoad || 'check-sso');
        return res;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    [onLoad]
  );

  useEffect(() => {
    if (initialized) {
      return;
    }

    const passport = getPassportInstance(clientOptions);

    init(passport)
      .then(res => {
        setInitialized(true);

        if (registerContext) {
          registerContext.forEach(callback => callback(passport));
        }

        if (!res) {
          onSuccess && onSuccess({ status: 'SUCCESS' });
          return;
        }

        const { claims, ...additionalInfo } = res;

        onSuccess && onSuccess({ status: 'SUCCESS', claims, additionalInfo });
      })
      .catch((error: any) => {
        setInitialized(false);

        onError && onError({ status: 'FAIL', error: error.message });
      })
      .finally(() => {
        setPassport(passport);
      });
  }, [onLoad, authorizationOptions?.redirect_uri, init, initialized]);

  useEffect(() => {
    if (!initialized) {
      setAuthenticated(false);
      return;
    }

    const checkAuthenticated = async () => {
      try {
        const { isEnable } = await passport.checkIsEnableTokenRotation();

        setAuthenticated(isEnable);
      } catch (error) {
        setAuthenticated(false);
      }
    };

    checkAuthenticated();
  }, [initialized, passport.isAuthenticated]);

  return (
    <PassportContext.Provider value={{ initialized, setInitialized, isAuthenticated, passport }}>
      {children}
    </PassportContext.Provider>
  );
}
