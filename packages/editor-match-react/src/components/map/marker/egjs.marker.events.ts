import type { Latlng } from '../../../types';

export enum EVENTS {
  INIT_MARKER = 'INIT_MARKER',
  LATLNG_CHANGE = 'LATLNG_CHANGE',
  COFIRM_MARKER = 'CONFIRM_MARKER',
  FIX_MARKER = 'FIX_MARKER',
  REMOVE_MARKER = 'REMOVE_MARKER',
  REVOKE_MARKER = 'REVOKE_MARKER',
}

export interface InitMarkerEvent {
  type: EVENTS.INIT_MARKER;
}

export interface LatlngChangeEvent {
  type: EVENTS.LATLNG_CHANGE;
  payload: { id: string | number; latlng: Latlng };
}

export interface ConfirmMarkerEvent {
  type: EVENTS.COFIRM_MARKER;
  payload: { id: string | number };
}

export interface FixMarkerEvent {
  type: EVENTS.FIX_MARKER;
  payload: { id: string | number };
}

export interface RemoveMarkerEvent {
  type: EVENTS.REMOVE_MARKER;
  payload: { id: string | number };
}

export interface RevokeMarkerEvent {
  type: EVENTS.REVOKE_MARKER;
  payload: { id: string | number };
}

export interface Events {
  [EVENTS.INIT_MARKER]: InitMarkerEvent;
  [EVENTS.LATLNG_CHANGE]: LatlngChangeEvent;
  [EVENTS.COFIRM_MARKER]: ConfirmMarkerEvent;
  [EVENTS.FIX_MARKER]: FixMarkerEvent;
  [EVENTS.REMOVE_MARKER]: RemoveMarkerEvent;
  [EVENTS.REVOKE_MARKER]: RevokeMarkerEvent;
}
