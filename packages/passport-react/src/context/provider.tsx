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

  const { onLoad, authorizationOptions } = clientOptions;

  const init = useCallback(
    async (passport: Passport) => {
      try {
        const claims = await passport.onLoad(onLoad || 'check-sso');
        return claims;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    [onLoad]
  );

  useEffect(() => {
    const passport = getPassportInstance(clientOptions);

    init(passport)
      .then(claims => {
        setInitialized(true);
        setPassport(passport);

        if (registerContext) {
          registerContext.forEach(callback => callback(passport));
        }

        if (!claims) {
          onSuccess && onSuccess({ status: 'SUCCESS' });
          return;
        }

        onSuccess && onSuccess({ status: 'SUCCESS', claims });
      })
      .catch((reason: any) => {
        onError && onError({ status: 'FAIL', error: reason });
        setPassport(passport);
        setInitialized(false);
      });
  }, [onLoad, authorizationOptions?.redirect_uri, init]);

  return <PassportContext.Provider value={{ initialized, passport }}>{children}</PassportContext.Provider>;
}
