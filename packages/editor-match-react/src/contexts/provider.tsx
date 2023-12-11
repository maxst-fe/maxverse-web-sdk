import type {
  ObjectClickEvent,
  PointEnterEvent,
  PointInitializeEvent,
  PointUnClickEvent,
} from '@maxverse/editor-web-sdk';
import { EVENTS, PickPoint } from '@maxverse/editor-web-sdk';
import type { ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import { DEFAULT_MAPPING_POINT_THEME, OBJECT_SORT, SYNC_INFO_STATUS } from '../constants';
import { usePointMaterial, useSyncInfo } from '../hooks';
import type { HexColor, MappingPointData, MatchEventCallbacks } from '../types';
import { MatchServiceContext } from './context';

interface Props {
  plyData: ArrayBuffer | null | undefined;
  mappingPointsData: MappingPointData[];
  matchEventCallbacks?: Partial<MatchEventCallbacks>;
  mappingPointTheme?: HexColor[];
  children: ReactNode;
}

export function MatchServiceProvider({
  plyData,
  mappingPointsData,
  matchEventCallbacks,
  mappingPointTheme = DEFAULT_MAPPING_POINT_THEME,
  children,
}: Props) {
  mappingPointsData = mappingPointsData ?? [];

  const pickPointRef = useRef<PickPoint | null>(null);
  const mappingPointThemeRef = useRef<HexColor[]>(mappingPointTheme);

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
    getSyncInfo,
    addNewSyncInfo,
    takeTurnSyncInfoStatus,
    plainUpdateSyncInfoStatus,
    removeSyncInfo,
    updateGpsCoorCallback,
    changeGpsCoorValue,
    undoRevokedSyncInfo,
  ] = useSyncInfo();

  const plainUpdatePointMaterialsTheme = (pointMaterials: THREE.Object3D[]) => {
    pointMaterials.forEach((pointMaterial, idx) => {
      const mesh = pointMaterial as THREE.Mesh;

      const isColorMaterial = (
        material: THREE.Material
      ): material is THREE.MeshBasicMaterial | THREE.MeshPhongMaterial => {
        return 'color' in material;
      };

      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(material => {
            if (isColorMaterial(material)) {
              material.color.set(mappingPointThemeRef.current[idx]);
            }
          });
        } else if (isColorMaterial(mesh.material)) {
          mesh.material.color.set(mappingPointThemeRef.current[idx]);
        }
      }
    });
  };

  const confirmPickPointCallback = useCallback(
    (id: string | number) => {
      pickPointRef.current?.pointGenerate();

      plainUpdateSyncInfoStatus(id, SYNC_INFO_STATUS.CONFIRM);

      plainUpdatePointMaterialsTheme(pointMaterials);
    },
    [pointMaterials, plainUpdateSyncInfoStatus]
  );

  const fixPickPointCallback = useCallback(
    (id: string | number) => {
      pickPointRef.current?.detachTransformFromPoint();

      plainUpdateSyncInfoStatus(id, SYNC_INFO_STATUS.CONFIRM);

      const targetPointMaterial = getPointMaterial(id);
      const targetSyncInfo = getSyncInfo(id);

      if (matchEventCallbacks?.fixCallback) {
        matchEventCallbacks.fixCallback({ targetPointMaterial, targetSyncInfo });
      }
    },
    [getPointMaterial, getSyncInfo, matchEventCallbacks, plainUpdateSyncInfoStatus]
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
      const { identity, filteredPointMaterials } = removePointMaterial(id);

      pickPointRef.current?.removeGeneratedPoint(id, identity);

      removeSyncInfo(id);

      plainUpdatePointMaterialsTheme(filteredPointMaterials);

      const targetPointMaterial = getPointMaterial(id);
      const targetSyncInfo = getSyncInfo(id);

      if (matchEventCallbacks?.removeCallback) {
        matchEventCallbacks.removeCallback({ targetPointMaterial, targetSyncInfo });
      }
    },
    [getPointMaterial, getSyncInfo, matchEventCallbacks, removePointMaterial, removeSyncInfo]
  );

  const cancelPickPointCallback = useCallback(
    (id: string | number) => {
      removePointMaterial(id);

      pickPointRef.current?.removeUnGeneratedPoint(id);
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

      const identity = takePointMaterialIdentity(target.uuid);

      plainUpdateSyncInfoStatus(target[identity], SYNC_INFO_STATUS.REVOKE);
    },
    [plainUpdateSyncInfoStatus, takePointMaterialIdentity]
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
        mappingPointThemeRef,
        pointMaterials,
        syncInfos,
        confirmPickPointCallback,
        fixPickPointCallback,
        removePickPointCallback,
        cancelPickPointCallback,
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
