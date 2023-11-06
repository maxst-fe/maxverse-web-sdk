import { useEffect, useRef, useState } from 'react';
import Editor, { PickPoint } from '@maxverse/editor-web-sdk';
import { useMatchService } from './useMatchService';
import { EDITOR_ERROR_MESSAGE } from '../constants/error';

export function useEditor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isInitMappingPointsData = useRef(false);

  const [editor, setEditor] = useState<Editor | null>(null);

  const { plyData, mappingPointsData, pickPointRef, initSphereObjectEventCallback } = useMatchService();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      console.error(EDITOR_ERROR_MESSAGE.UN_DECLARE_CANVAS);
      return;
    }
    if (!(canvas instanceof HTMLCanvasElement)) {
      console.error(EDITOR_ERROR_MESSAGE.INVALID_CANVAS_TYPE);
      return;
    }

    const editor = new Editor({ canvas });
    editor.init();

    pickPointRef.current = new PickPoint(editor);

    if (!pickPointRef.current) {
      console.error(EDITOR_ERROR_MESSAGE.INVALID_PICK_POINT_INSTANCE);
      return;
    }

    pickPointRef.current.turnOnOff('on');

    editor.plugin([pickPointRef.current]);

    setEditor(editor);

    return () => {
      editor.remove();
    };
  }, []);

  useEffect(() => {
    if (!editor) {
      console.error(EDITOR_ERROR_MESSAGE.INVALID_EDITOR_INSTANCE);
      return;
    }
    if (!plyData) {
      console.error(EDITOR_ERROR_MESSAGE.UN_DECLARE_PLY_DATA);
      return;
    }

    const loadPlyData = async () => {
      await editor.loadPLY(plyData);
    };

    loadPlyData();
  }, [editor, plyData]);

  useEffect(() => {
    /**
     * @description server state is not yet loaded
     */
    if (mappingPointsData.length === 0 || !plyData) {
      return;
    }
    /**
     * @description prevention of duplicate init action
     */
    if (isInitMappingPointsData.current) {
      return;
    }
    if (!editor) {
      console.error(EDITOR_ERROR_MESSAGE.INVALID_EDITOR_INSTANCE);
      return;
    }
    if (!pickPointRef.current) {
      console.error(EDITOR_ERROR_MESSAGE.INVALID_PICK_POINT_INSTANCE);
      return;
    }

    editor.on('point_initialize', event => initSphereObjectEventCallback(event));

    const positions = mappingPointsData.map(mappingPointData => {
      const {
        id,
        point_coordinate: {
          pick_point: { x, y, z },
        },
      } = mappingPointData;

      return { uuid: id, x: Number(x), y: Number(y), z: Number(z) };
    });

    pickPointRef.current.generatePointsFromPosition(positions);

    isInitMappingPointsData.current = true;

    return () => {
      editor.off('point_initialize');
    };
  }, [editor, pickPointRef, plyData, mappingPointsData, initSphereObjectEventCallback]);

  return [editor, canvasRef] as const;
}
