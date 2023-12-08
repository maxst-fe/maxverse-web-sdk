import type {
  ChagingTransformEvent,
  ObjectClickEvent,
  PointEnterEvent,
  PointInitializeEvent,
  PointUnClickEvent,
} from '@maxverse/editor-web-sdk';
import { PickPoint } from '@maxverse/editor-web-sdk';
import type { MutableRefObject } from 'react';
import { createContext } from 'react';
import { Object3D } from 'three';
import { DEFAULT_MAPPING_POINT_THEME } from '../constants';
import type {
  GpsCoor,
  HexColor,
  IdentityCandidate,
  LatlngCandidate,
  MappingPointData,
  PositionCandidate,
  SyncInfo,
} from '../types';

export const MatchServiceContext = createContext<{
  plyData: ArrayBuffer | null | undefined;
  mappingPointsData: MappingPointData[];
  pickPointRef: MutableRefObject<PickPoint | null>;
  mappingPointThemeRef: MutableRefObject<HexColor[]>;
  pointMaterials: Object3D[];
  syncInfos: SyncInfo[];
  confirmPickPointCallback: (id: string | number) => void;
  fixPickPointCallback: (id: string | number) => void;
  removePickPointCallback: (id: string | number) => void;
  cancelPickPointCallback: (id: string | number) => void;
  revokePickPointCallback: (id: string | number) => void;
  updateGpsCoorCallback: (gpsCoor: GpsCoor) => void;
  enterSphereObjectEventCallback: (event: PointEnterEvent) => void;
  initSphereObjectEventCallback: (event: PointInitializeEvent) => void;
  clickSphereObjectEventCallback: (event: ObjectClickEvent) => void;
  unClickSphereObjectEventCallback: (event: PointUnClickEvent) => void;
  chagingTransformEventCallback: (event: ChagingTransformEvent) => void;
  changeGpsCoorValue: (id: string | number, value: string, key: LatlngCandidate) => void;
  changePositionValue: (id: string | number, value: string, key: PositionCandidate) => void;
  takePointMaterialIdentity: (id: string | number) => IdentityCandidate;
}>({
  plyData: null,
  mappingPointsData: [],
  pickPointRef: { current: null },
  mappingPointThemeRef: { current: DEFAULT_MAPPING_POINT_THEME },
  pointMaterials: [],
  syncInfos: [],
  confirmPickPointCallback: (_id: string | number) => {},
  fixPickPointCallback: (_id: string | number) => {},
  removePickPointCallback: (_id: number | string) => {},
  cancelPickPointCallback: (_id: string | number) => {},
  revokePickPointCallback: (_id: string | number) => {},
  updateGpsCoorCallback: (_gpsCoor: GpsCoor) => {},
  enterSphereObjectEventCallback: (_event: PointEnterEvent) => {},
  initSphereObjectEventCallback: (_event: PointInitializeEvent) => {},
  clickSphereObjectEventCallback: (_event: ObjectClickEvent) => {},
  unClickSphereObjectEventCallback: (_event: PointUnClickEvent) => {},
  chagingTransformEventCallback: (_event: ChagingTransformEvent) => {},
  changeGpsCoorValue: (_id: string | number, _value: string, _key: LatlngCandidate) => {},
  changePositionValue: (_id: string | number, _value: string, _key: PositionCandidate) => {},
  takePointMaterialIdentity: (_id: string | number) => {
    return 'id';
  },
});

export const MatchServiceContextConsumer = MatchServiceContext.Consumer;
