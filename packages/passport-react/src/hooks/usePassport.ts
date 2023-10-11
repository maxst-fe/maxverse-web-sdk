import { useContext } from 'react';
import { PassportContext } from '../context/context';

export function usePassport() {
  const { initialized, setInitialized, isAuthenticated, passport } = useContext(PassportContext);

  const requestLogoutWithFallback = async () => {
    try {
      await passport.requestLogout();

      if (setInitialized) {
        setInitialized(false);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  return { initialized, isAuthenticated, passport, requestLogoutWithFallback };
}
