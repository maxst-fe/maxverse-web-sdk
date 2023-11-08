import { useEffect } from 'react';
import type {
  ConfirmMarkerEvent,
  FixMarkerEvent,
  LatlngChangeEvent,
  RemoveMarkerEvent,
  RevokeMarkerEvent,
} from '../components/map';
import { EVENTS, MarkerOverlayView } from '../components/map';
import { useMatchService } from './useMatchService';
import { MAP_ERROR_MESSAGE } from '../constants/error';

export function useMarkerEvents(markerOverlayView: MarkerOverlayView | null) {
  const {
    confirmPickPointCallback,
    fixPickPointCallback,
    removePickPointCallback,
    revokePickPointCallback,
    updateGpsCoorCallback,
  } = useMatchService();
  const useMarkerEventsEffect = (callback: (markerOverlayView: MarkerOverlayView) => void, deps: any[] = []) =>
    useEffect(() => {
      if (!markerOverlayView) {
        console.error(MAP_ERROR_MESSAGE.INVALID_MARKER_INSTANCE);
        return;
      }

      return callback(markerOverlayView);
    }, [...deps, markerOverlayView]);

  useMarkerEventsEffect(
    markerOverlayView => {
      markerOverlayView.on(EVENTS.COFIRM_MARKER, (event: ConfirmMarkerEvent) => {
        confirmPickPointCallback(event.payload.id);
      });

      return () => {
        markerOverlayView.off(EVENTS.COFIRM_MARKER);
      };
    },
    [confirmPickPointCallback]
  );

  useMarkerEventsEffect(
    markerOverlayView => {
      markerOverlayView.on(EVENTS.FIX_MARKER, (event: FixMarkerEvent) => {
        fixPickPointCallback(event.payload.id);
      });

      return () => {
        markerOverlayView.off(EVENTS.FIX_MARKER);
      };
    },
    [fixPickPointCallback]
  );

  useMarkerEventsEffect(
    markerOverlayView => {
      markerOverlayView.on(EVENTS.REMOVE_MARKER, (event: RemoveMarkerEvent) => {
        removePickPointCallback(event.payload.id);
      });

      return () => {
        markerOverlayView.off(EVENTS.REMOVE_MARKER);
      };
    },
    [removePickPointCallback]
  );

  useMarkerEventsEffect(
    markerOverlayView => {
      markerOverlayView.on(EVENTS.REVOKE_MARKER, (event: RevokeMarkerEvent) => {
        revokePickPointCallback(event.payload.id);
      });

      return () => {
        markerOverlayView.off(EVENTS.REVOKE_MARKER);
      };
    },
    [revokePickPointCallback]
  );

  useMarkerEventsEffect(
    markerOverlayView => {
      markerOverlayView.on(EVENTS.LATLNG_CHANGE, (event: LatlngChangeEvent) => {
        updateGpsCoorCallback(event.payload);
      });

      return () => {
        markerOverlayView.off(EVENTS.LATLNG_CHANGE);
      };
    },
    [updateGpsCoorCallback]
  );
}
