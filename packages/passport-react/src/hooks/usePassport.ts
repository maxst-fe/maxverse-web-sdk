import { useContext } from 'react';
import { PassportContext } from '../context/context';

export function usePassport() {
  const { initialized, setInitialized, passport } = useContext(PassportContext);

  const requestLogoutWithFallback = async () => {
    try {
      await passport.requestLogout();

      if (setInitialized) {
        setInitialized(false);
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return { initialized, passport, requestLogoutWithFallback };
}
