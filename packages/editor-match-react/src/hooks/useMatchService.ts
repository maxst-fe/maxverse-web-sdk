import { useContext } from 'react';
import { MatchServiceContext } from '../contexts';

export function useMatchService() {
  return useContext(MatchServiceContext);
}
