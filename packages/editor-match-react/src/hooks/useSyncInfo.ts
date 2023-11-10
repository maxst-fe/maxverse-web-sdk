/* eslint-disable @typescript-eslint/ban-types */
import { useCallback, useState } from 'react';
import { SYNC_INFO_STATUS } from '../constants';
import type { GpsCoor, LatlngCandidate, MapData, SyncInfo } from '../types';

export function useSyncInfo() {
  const [syncInfos, setSyncInfos] = useState<SyncInfo[]>([]);

  const useSyncInfoCallback = <T extends Function>(callback: T, deps: any[] = []) =>
    useCallback<T>(callback, [...deps, syncInfos]);

  const getSyncInfo = useSyncInfoCallback((id: string | number) => {
    const targetSyncInfo = syncInfos.find(syncInfo => syncInfo.id === id);

    return targetSyncInfo;
  });

  const undoRevokedSyncInfo = useSyncInfoCallback<(targetSyncInfos?: SyncInfo[]) => SyncInfo[]>(
    (targetSyncInfos?: SyncInfo[]) => {
      targetSyncInfos = targetSyncInfos ?? syncInfos;
      if (targetSyncInfos.length === 0) {
        return targetSyncInfos;
      }

      return targetSyncInfos.map(syncInfo => {
        return syncInfo.status === SYNC_INFO_STATUS.REVOKE
          ? { ...syncInfo, status: SYNC_INFO_STATUS.CONFIRM }
          : syncInfo;
      });
    }
  );

  const addNewSyncInfo = useSyncInfoCallback(
    (id: string | number, map: MapData | null = null, status: SYNC_INFO_STATUS = SYNC_INFO_STATUS.ENTER) => {
      const latlng = map ? { lng: Number(map.x), lat: Number(map.y) } : { lat: 0, lng: 0 };

      const newSyncInfo: SyncInfo = {
        id,
        label: 'syncInfo',
        status,
        latlng,
      };

      setSyncInfos(prev => {
        const originSyncInfos = undoRevokedSyncInfo(prev);
        return [...originSyncInfos, newSyncInfo];
      });
    },
    [undoRevokedSyncInfo]
  );

  const takeTurnSyncInfotatus = useSyncInfoCallback((id: string | number) => {
    const resetedsyncInfo = syncInfos.map(syncInfo => {
      const status = syncInfo.status === SYNC_INFO_STATUS.ENTER ? SYNC_INFO_STATUS.RE_ENTER : SYNC_INFO_STATUS.ENTER;
      if (syncInfo.id === id) {
        return { ...syncInfo, status };
      }
      return syncInfo;
    });

    setSyncInfos(resetedsyncInfo);
  });

  const plainUpdateSyncInfotatus = useSyncInfoCallback((id: string | number, status: SYNC_INFO_STATUS) => {
    const originsyncInfo = undoRevokedSyncInfo();

    const updatedsyncInfo = originsyncInfo.map(syncInfo => {
      return syncInfo.id === id ? { ...syncInfo, status } : syncInfo;
    });

    setSyncInfos(updatedsyncInfo);
  });

  const removeSyncInfo = useSyncInfoCallback((id: string | number) => {
    const removedsyncInfo = syncInfos.filter(syncInfo => syncInfo.id !== id);

    setSyncInfos(removedsyncInfo);
  });

  const updateGpsCoorCallback = useSyncInfoCallback((gpsCoor: GpsCoor) => {
    const updatedsyncInfo = syncInfos.map(syncInfo => {
      if (syncInfo.id === gpsCoor.id) {
        return { ...syncInfo, latlng: gpsCoor.latlng };
      }
      return syncInfo;
    });

    setSyncInfos(updatedsyncInfo);
  });

  const changeGpsCoorValue = useSyncInfoCallback((id: string | number, value: string, key: LatlngCandidate) => {
    const updatedsyncInfo = syncInfos.map(syncInfo => {
      if (syncInfo.id === id) {
        return {
          ...syncInfo,
          latlng: { ...syncInfo.latlng, [key]: Number(value) },
        };
      }
      return syncInfo;
    });

    setSyncInfos(updatedsyncInfo);
  });

  return [
    syncInfos,
    setSyncInfos,
    getSyncInfo,
    addNewSyncInfo,
    takeTurnSyncInfotatus,
    plainUpdateSyncInfotatus,
    removeSyncInfo,
    updateGpsCoorCallback,
    changeGpsCoorValue,
    undoRevokedSyncInfo,
  ] as const;
}
