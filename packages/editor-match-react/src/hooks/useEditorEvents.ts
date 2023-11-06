import { useEffect } from 'react';
import Editor, { PointEnterEvent } from '@maxverse/editor-web-sdk';
import { useMatchService } from './useMatchService';
import { EDITOR_ERROR_MESSAGE } from '../constants/error';

export function useEditorEvents(editor: Editor | null) {
  const {
    enterSphereObjectEventCallback,
    clickSphereObjectEventCallback,
    unClickSphereObjectEventCallback,
    chagingTransformEventCallback,
  } = useMatchService();

  const useEditorEventsEffect = (callback: (editor: Editor) => void, deps: any[] = []) =>
    useEffect(() => {
      if (!editor) {
        console.error(EDITOR_ERROR_MESSAGE.INVALID_EDITOR_INSTANCE);
        return;
      }
      return callback(editor);
    }, [...deps, editor]);

  useEditorEventsEffect(
    editor => {
      editor.on('point_enter', (event: PointEnterEvent) => enterSphereObjectEventCallback(event));

      return () => {
        editor.off('point_enter');
      };
    },
    [enterSphereObjectEventCallback]
  );

  useEditorEventsEffect(
    editor => {
      editor.on('object_click', event => clickSphereObjectEventCallback(event));

      return () => {
        editor.off('object_click');
      };
    },
    [clickSphereObjectEventCallback]
  );

  useEditorEventsEffect(
    editor => {
      editor.on('point_unclick', event => unClickSphereObjectEventCallback(event));

      return () => {
        editor.off('point_unclick');
      };
    },
    [unClickSphereObjectEventCallback]
  );

  useEditorEventsEffect(
    editor => {
      editor.on('chaging_transform', event => chagingTransformEventCallback(event));

      return () => {
        editor.off('chaging_transform');
      };
    },
    [chagingTransformEventCallback]
  );
}
