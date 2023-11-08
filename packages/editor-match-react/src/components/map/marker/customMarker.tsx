import { useEffect, useRef, useState } from 'react';
import type { SyncInfo } from '../../../types';
import { SYNC_INFO_STATUS } from '../../../constants';
import { MarkerOverlayView } from './markerOverlayView';
import { useMarkerEvents } from '../../../hooks';
import { COMMON_ERROR_MESSAGE, MAP_ERROR_MESSAGE } from '../../../constants/error';
import { EVENTS } from './egjs.marker.events';

interface Props {
  sync: SyncInfo;
  map: google.maps.Map | null;
}

export function CustomMarker({ sync, map }: Props) {
  const [markerOverlayView, setMarkerOverlayView] = useState<MarkerOverlayView | null>(null);
  const prevStatusRef = useRef<SYNC_INFO_STATUS>();

  const { id, label, status, latlng } = sync;

  useMarkerEvents(markerOverlayView);

  useEffect(() => {
    if (!sync) {
      console.error(COMMON_ERROR_MESSAGE.INVALID_SYNC_INFO);
      return;
    }
    if (!map) {
      console.error(MAP_ERROR_MESSAGE.INVALID_MAP_API);
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
  }, [id, label, latlng, map]);

  useEffect(() => {
    if (!markerOverlayView) {
      console.error(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
      return;
    }
    if (!map) {
      console.error(MAP_ERROR_MESSAGE.INVALID_MAP_API);
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
      markerOverlayView.disableElement();
    }
    if (status === SYNC_INFO_STATUS.RE_ENTER || status === SYNC_INFO_STATUS.ENTER) {
      const center = map.getCenter();

      markerOverlayView.overlayView.set('position', center);
      markerOverlayView.overlayView.draw();
    }
  }, [markerOverlayView, map, status]);

  useEffect(() => {
    if (!markerOverlayView) {
      console.error(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
      return;
    }

    markerOverlayView.on(EVENTS.INIT_MARKER, () => {
      if (status === SYNC_INFO_STATUS.CONFIRM) {
        markerOverlayView.disableElement();
      }

      return () => {
        markerOverlayView.off(EVENTS.INIT_MARKER);
      };
    });
  }, [markerOverlayView, status]);

  useEffect(() => {
    if (!markerOverlayView) {
      console.error(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
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
    return () => {
      if (!markerOverlayView) {
        console.error(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
        return;
      }

      markerOverlayView.overlayView.setMap(null);
    };
  }, [markerOverlayView]);

  return null;
}
