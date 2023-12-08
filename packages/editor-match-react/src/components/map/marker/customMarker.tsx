import { useEffect, useRef, useState } from 'react';
import { SYNC_INFO_STATUS } from '../../../constants';
import { COMMON_ERROR_MESSAGE, MAP_ERROR_MESSAGE } from '../../../constants/error';
import { useMarkerEvents, useMatchService } from '../../../hooks';
import type { SyncInfo } from '../../../types';
import { EVENTS } from './egjs.marker.events';
import { MarkerOverlayView } from './markerOverlayView';

interface Props {
  sync: SyncInfo;
  map: google.maps.Map | null;
  order: number;
}

export function CustomMarker({ sync, map, order }: Props) {
  const [markerOverlayView, setMarkerOverlayView] = useState<MarkerOverlayView | null>(null);
  const prevStatusRef = useRef<SYNC_INFO_STATUS>();

  const { id, label, status, latlng } = sync;

  const { mappingPointThemeRef } = useMatchService();

  useMarkerEvents(markerOverlayView);

  useEffect(() => {
    if (!sync) {
      console.warn(COMMON_ERROR_MESSAGE.INVALID_SYNC_INFO);
      return;
    }
    if (!map) {
      console.warn(MAP_ERROR_MESSAGE.INVALID_MAP_API);
      return;
    }

    if (markerOverlayView) {
      return;
    }

    const center = map.getCenter();

    if (!center) {
      return;
    }

    const initialLatlng = latlng.lat === 0 && latlng.lng === 0 ? center : latlng;

    const markerOverlayViewInstance = new MarkerOverlayView({ id, label });

    markerOverlayViewInstance.overlayView.set('position', initialLatlng);
    markerOverlayViewInstance.overlayView.setMap(map);

    setMarkerOverlayView(markerOverlayViewInstance);
  }, [id, label, latlng, map, markerOverlayView, sync]);

  useEffect(() => {
    if (!markerOverlayView) {
      console.warn(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
      return;
    }
    if (!map) {
      console.warn(MAP_ERROR_MESSAGE.INVALID_MAP_API);
      return;
    }

    if (prevStatusRef.current === status) {
      return;
    }

    prevStatusRef.current = status;

    if (status === SYNC_INFO_STATUS.REVOKE) {
      markerOverlayView.revokeElement();
    }
    if (status === SYNC_INFO_STATUS.CONFIRM) {
      markerOverlayView.setThemeColor(mappingPointThemeRef.current[order]);
      markerOverlayView.disableElement();
    }
    if (status === SYNC_INFO_STATUS.RE_ENTER || status === SYNC_INFO_STATUS.ENTER) {
      const center = map.getCenter();

      markerOverlayView.overlayView.set('position', center);
      markerOverlayView.overlayView.draw();
    }
  }, [markerOverlayView, map, status, order, mappingPointThemeRef]);

  useEffect(() => {
    if (!markerOverlayView) {
      console.warn(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
      return;
    }

    markerOverlayView.on(EVENTS.INIT_MARKER, () => {
      if (status === SYNC_INFO_STATUS.CONFIRM) {
        markerOverlayView.setThemeColor(mappingPointThemeRef.current[order]);
        markerOverlayView.disableElement();
      }

      return () => {
        markerOverlayView.off(EVENTS.INIT_MARKER);
      };
    });
  }, [mappingPointThemeRef, markerOverlayView, order, status]);

  useEffect(() => {
    if (!markerOverlayView) {
      console.warn(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
      return;
    }

    const initialLatlng = latlng.lng === 0 && latlng.lat === 0;

    if (initialLatlng) {
      return;
    }

    markerOverlayView.overlayView.set('position', latlng);
    markerOverlayView.overlayView.draw();
  }, [markerOverlayView, latlng]);

  useEffect(() => {
    if (!markerOverlayView) {
      console.warn(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
      return;
    }

    if (status !== SYNC_INFO_STATUS.CONFIRM) {
      return;
    }

    markerOverlayView.setThemeColor(mappingPointThemeRef.current[order]);
  }, [mappingPointThemeRef, markerOverlayView, order, status]);

  useEffect(() => {
    return () => {
      if (!markerOverlayView) {
        console.warn(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
        return;
      }

      markerOverlayView.overlayView.setMap(null);
    };
  }, [markerOverlayView]);

  return null;
}
