import type { HexColor } from '../types';

export enum SYNC_INFO_STATUS {
  ENTER = 'ENTER',
  RE_ENTER = 'RE_ENTER',
  CONFIRM = 'CONFIRM',
  REVOKE = 'REVOKE',
}

export enum OBJECT_SORT {
  POINT_SPHERE = 'POINT_SPHERE',
}

export const DEFAULT_MAPPING_POINT_THEME: HexColor[] = ['#F567AC', '#E59BFF', '#1DD9E7', '#F97F0E', '#00C400'];
