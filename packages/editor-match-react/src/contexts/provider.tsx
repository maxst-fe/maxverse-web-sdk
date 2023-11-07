import type { ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import type {
  ObjectClickEvent,
  PointEnterEvent,
  PointInitializeEvent,
  PointUnClickEvent,
} from '@maxverse/editor-web-sdk';
import { EVENTS, PickPoint } from '@maxverse/editor-web-sdk';
import { MatchServiceContext } from './context';
import { usePointMaterial, useSyncInfo } from '../hooks';
import type { MappingPointData } from '../types';
import { OBJECT_SORT, SYNC_INFO_STATUS } from '../constants';

interface Props {
  plyData: ArrayBuffer | null;
  mappingPointsData: MappingPointData[];
  children: ReactNode;
}

export function MatchServiceProvider({ plyData, mappingPointsData, children }: Props) {
  mappingPointsData = mappingPointsData ?? [];

  const pickPointRef = useRef<PickPoint | null>(null);

  const [
    pointMaterials,
    addNewPointMaterial,
    getPointMaterial,
    removePointMaterial,
    checkReEnterPointMaterial,
    chagingTransformEventCallback,
    changePositionValue,
    takePointMaterialIdentity,
  ] = usePointMaterial(mappingPointsData);
  const [
    syncInfos,
    setSyncInfos,
    addNewSyncInfo,
    takeTurnSyncInfoStatus,
    plainUpdateSyncInfoStatus,
    removeSyncInfo,
    updateGpsCoorCallback,
    changeGpsCoorValue,
    undoRevokedSyncInfo,
  ] = useSyncInfo();

  const confirmPickPointCallback = useCallback(
    (id: string | number) => {
      pickPointRef.current?.pointGenerate();

      plainUpdateSyncInfoStatus(id, SYNC_INFO_STATUS.CONFIRM);
    },
    [plainUpdateSyncInfoStatus]
  );

  const fixPickPointCallback = useCallback(
    (id: string | number) => {
      pickPointRef.current?.detachTransformFromPoint();

      plainUpdateSyncInfoStatus(id, SYNC_INFO_STATUS.CONFIRM);
    },
    [plainUpdateSyncInfoStatus]
  );

  const revokePickPointCallback = useCallback(
    (id: string | number) => {
      const targetMaterial = getPointMaterial(id);

      if (!targetMaterial) {
        return;
      }

      pickPointRef.current?.attachTransformToPoint(targetMaterial);

      plainUpdateSyncInfoStatus(id, SYNC_INFO_STATUS.REVOKE);
    },
    [getPointMaterial, plainUpdateSyncInfoStatus]
  );

  const removePickPointCallback = useCallback(
    (id: string | number) => {
      const identity = removePointMaterial(id);

      pickPointRef.current?.removeGeneratedPoint(id, identity);

      removeSyncInfo(id);
    },
    [removePointMaterial, removeSyncInfo]
  );

  const clickSphereObjectEventCallback = useCallback(
    (event: ObjectClickEvent) => {
      const { target } = event;
      if (target.name !== OBJECT_SORT.POINT_SPHERE) {
        return;
      }

      plainUpdateSyncInfoStatus(target.id, SYNC_INFO_STATUS.REVOKE);
    },
    [plainUpdateSyncInfoStatus]
  );

  const enterSphereObjectEventCallback = useCallback(
    (event: PointEnterEvent) => {
      const { target } = event;

      if (target.name !== OBJECT_SORT.POINT_SPHERE) {
        return;
      }

      const isAlreadyExistSphere = checkReEnterPointMaterial(target.id);

      if (isAlreadyExistSphere) {
        takeTurnSyncInfoStatus(target.id);
        return;
      }

      addNewPointMaterial(target);

      addNewSyncInfo(target.id);
    },
    [checkReEnterPointMaterial, takeTurnSyncInfoStatus, addNewPointMaterial, addNewSyncInfo]
  );

  const initSphereObjectEventCallback = useCallback(
    (event: PointInitializeEvent) => {
      const { target } = event;
      addNewPointMaterial(target);

      const targetMappingData = mappingPointsData.find(mappingPointData => event.uuid === mappingPointData.id);
      const map = targetMappingData?.point_coordinate.map;

      if (!map) {
        return;
      }

      addNewSyncInfo(event.uuid, map, SYNC_INFO_STATUS.CONFIRM);
    },
    [addNewPointMaterial, mappingPointsData, addNewSyncInfo]
  );

  const unClickSphereObjectEventCallback = useCallback(
    (event: PointUnClickEvent) => {
      const { type } = event;

      if (type !== EVENTS.POINT_UNCLICK) {
        return;
      }

      const undoRevokedSyncInfos = undoRevokedSyncInfo();

      setSyncInfos(undoRevokedSyncInfos);
    },
    [undoRevokedSyncInfo, setSyncInfos]
  );

  return (
    <MatchServiceContext.Provider
      value={{
        plyData,
        mappingPointsData,
        pickPointRef,
        pointMaterials,
        syncInfos,
        confirmPickPointCallback,
        fixPickPointCallback,
        removePickPointCallback,
        revokePickPointCallback,
        updateGpsCoorCallback,
        enterSphereObjectEventCallback,
        initSphereObjectEventCallback,
        clickSphereObjectEventCallback,
        unClickSphereObjectEventCallback,
        chagingTransformEventCallback,
        changeGpsCoorValue,
        changePositionValue,
        takePointMaterialIdentity,
      }}
    >
      {children}
    </MatchServiceContext.Provider>
  );
}