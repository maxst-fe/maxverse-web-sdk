/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Passport, PassportClientOptions } from '@maxverse/passport-web-sdk';
import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { checkClientOptionsDiff } from '../helpers/index';
import { PassportContext } from './context';
import { getPassportInstance } from './passport-instance';
import { PassportProviderProps } from './types';

export function PassportProvider({
  clientOptions,
  onSuccess,
  onError,
  children,
}: PropsWithChildren<PassportProviderProps>) {
  const [initialized, setInitialized] = useState(false);
  const [passport, setPassport] = useState(getPassportInstance());

  const clientOptionsRef = useRef<PassportClientOptions | null>(null);

  const isDiff = useMemo(() => {
    const { current } = clientOptionsRef;
    return checkClientOptionsDiff(current, clientOptions);
  }, [clientOptions]);

  const { onLoad } = clientOptions;

  const init = useCallback(
    async (passport: Passport) => {
      try {
        const claims = await passport.onLoad(onLoad || 'check-sso');
        return claims;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    [isDiff]
  );

  useEffect(() => {
    const passport = getPassportInstance(clientOptions);

    init(passport)
      .then(claims => {
        setInitialized(true);
        setPassport(passport);

        clientOptionsRef.current = clientOptions;

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
  }, [isDiff, init]);

  return <PassportContext.Provider value={{ initialized, passport }}>{children}</PassportContext.Provider>;
}
