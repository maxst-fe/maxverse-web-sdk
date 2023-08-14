import { useContext } from 'react';
import { PassportContext } from '../context/context';

export function usePassport() {
  const { initialized, passport } = useContext(PassportContext);

  return { initialized, passport };
}
