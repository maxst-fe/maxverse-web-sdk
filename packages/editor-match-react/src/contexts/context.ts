import { createContext } from 'react';
import type { MutableRefObject } from 'react';
import { Object3D } from 'three';
import { PickPoint } from '@maxverse/editor-web-sdk';
import type {
  PointEnterEvent,
  PointInitializeEvent,
  ObjectClickEvent,
  PointUnClickEvent,
  ChagingTransformEvent,
} from '@maxverse/editor-web-sdk';
import type {
  SyncInfo,
  GpsCoor,
  PositionCandidate,
  LatlngCandidate,
  IdentityCandidate,
  MappingPointData,
} from '../types';

export const MatchServiceContext = createContext<{
  plyData: ArrayBuffer | null;
  mappingPointsData: MappingPointData[];
  pickPointRef: MutableRefObject<PickPoint | null>;
  pointMaterials: Object3D[];
  syncInfos: SyncInfo[];
  confirmPickPointCallback: (id: string | number) => void;
  fixPickPointCallback: (id: string | number) => void;
  removePickPointCallback: (id: string | number) => void;
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
  pointMaterials: [],
  syncInfos: [],
  confirmPickPointCallback: (_id: string | number) => {},
  fixPickPointCallback: (_id: string | number) => {},
  removePickPointCallback: (_id: number | string) => {},
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
