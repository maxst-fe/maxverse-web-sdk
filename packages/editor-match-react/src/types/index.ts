import { SYNC_INFO_STATUS } from '../constants';
import { Object3D } from 'three';

export type LatlngCandidate = 'lat' | 'lng';

export type PositionCandidate = 'x' | 'y' | 'z';

export type IdentityCandidate = 'id' | 'uuid';

export type MatchEventPayload = { targetPointMaterial: Object3D | undefined; targetSyncInfo: SyncInfo | undefined };
export interface Latlng {
  lat: number;
  lng: number;
}

export interface GpsCoor {
  id: string | number;
  latlng: Latlng;
}

export interface PickPointData {
  x: string;
  y: string;
  z: string;
}

export interface MapData {
  x: string;
  y: string;
}
export interface SyncInfo {
  id: string | number;
  label: string;
  status: SYNC_INFO_STATUS;
  latlng: Latlng;
}

export interface GpsCoor {
  id: string | number;
  latlng: Latlng;
}

export interface MappingPointData {
  id: string;
  seq: string;
  point_coordinate: {
    pick_point: PickPointData;
    map: MapData;
  };
}
export interface MatchEventCallbacks {
  fixCallback: (payload: MatchEventPayload) => void;
  removeCallback: (payload: MatchEventPayload) => void;
}
