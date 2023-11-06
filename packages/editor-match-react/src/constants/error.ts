export enum EDITOR_ERROR_MESSAGE {
  UN_DECLARE_CANVAS = 'canvas element is not declared',
  UN_DECLARE_PLY_DATA = 'ply data resource is not declared',
  INVALID_CANVAS_TYPE = 'canvas type do not match of `HTMLCanvasElement`',
  INVALID_EDITOR_INSTANCE = 'editor instance is currently invalid state',
  INVALID_PICK_POINT_INSTANCE = 'pick point instance is currently invalid state',
}

export enum COMMON_ERROR_MESSAGE {
  INVALID_SYNC_INFO = 'sync info is currently invalid state',
}

export enum MAP_ERROR_MESSAGE {
  INVALID_MAP_API = 'map api is currently invalid state',
  INVALID_MARKER_INSTANCE = 'marker instance be currently uninitialized',
}
