/* eslint-disable @typescript-eslint/ban-types */
import { ChagingTransformEvent } from '@maxverse/editor-web-sdk';
import { useCallback, useState } from 'react';
import { Object3D } from 'three';
import type { IdentityCandidate, MappingPointData, PositionCandidate } from '../types';

export function usePointMaterial(mappingPointsData: MappingPointData[]) {
  const [pointMaterials, setPointMaterials] = useState<Object3D[]>([]);

  const addNewPointMaterial = useCallback((pointMaterial: Object3D) => {
    setPointMaterials(prev => [...prev, pointMaterial]);
  }, []);

  const takePointMaterialIdentity = useCallback(
    (id: string | number): IdentityCandidate => {
      const serverState = mappingPointsData.find(mappingPointData => mappingPointData.id === id);

      return serverState ? 'uuid' : 'id';
    },
    [mappingPointsData]
  );

  const usePointMaterialCallback = <T extends Function>(callback: T, deps: any[] = []) =>
    useCallback<T>(callback, [...deps, pointMaterials, takePointMaterialIdentity]);

  const getPointMaterial = usePointMaterialCallback((id: string | number) => {
    const identity = takePointMaterialIdentity(id);

    return pointMaterials.find(pointMaterial => pointMaterial[identity] === id);
  });

  const removePointMaterial = usePointMaterialCallback<(id: string | number) => IdentityCandidate>(
    (id: string | number) => {
      const identity = takePointMaterialIdentity(id);

      const removedPointMaterials = pointMaterials.filter(pointMaterial => pointMaterial[identity] !== id);

      setPointMaterials(removedPointMaterials);

      return identity;
    }
  );

  const checkReEnterPointMaterial = usePointMaterialCallback((id: string | number) => {
    const identity = takePointMaterialIdentity(id);

    return pointMaterials.some(pointMaterial => pointMaterial[identity] === id);
  });

  const chagingTransformEventCallback = usePointMaterialCallback((event: ChagingTransformEvent) => {
    const { target } = event;

    if (target.name !== 'POINT_SPHERE') {
      return;
    }

    const identity = takePointMaterialIdentity(target.uuid);

    const updatedPointMaterials = pointMaterials.map(pointMaterial => {
      return pointMaterial[identity] === target[identity] ? target : pointMaterial;
    });

    setPointMaterials(updatedPointMaterials);
  });

  const changePositionValue = usePointMaterialCallback((id: string | number, value: string, key: PositionCandidate) => {
    const identity = takePointMaterialIdentity(id);
    const updatedPointMaterials = pointMaterials.map(pointMaterial => {
      if (pointMaterial[identity] === id) {
        pointMaterial.position[key] = Number(value);
      }
      return pointMaterial;
    });

    setPointMaterials(updatedPointMaterials);
  });

  return [
    pointMaterials,
    addNewPointMaterial,
    getPointMaterial,
    removePointMaterial,
    checkReEnterPointMaterial,
    chagingTransformEventCallback,
    changePositionValue,
    takePointMaterialIdentity,
  ] as const;
}
