import { Object3D } from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2';
import Editor from '../app';

export const EVENTS = {
  READY: 'ready',
  RESIZE: 'resize',
  REMOVE: 'remove',
  LOAD_START: 'load_start',
  LOAD: 'load',
  LOAD_FAIL: 'load_fail',
  LINE_DISTANCE: 'line_distance',
  RENDER: 'render',
  OBJECT_CLICK: 'object_click',
  POINT_ENTER: 'point_enter',
  POINT_INITIALIZE: 'point_initialize',
  POINT_UNCLICK: 'point_unclick',
  CHAHEING_TRANSFORM: 'chaging_transform',
} as const;

export interface ObjectClickEvent {
  type: string;
  target: Object3D;
}

export interface ReadyEvent {
  type: string;
  target: Editor;
}

export interface ResizeEvent {
  type: string;
  target: Editor;
}

export interface LoadStartEvent {
  type: string;
  target: Editor;
  loadStartData?: any;
}

export interface LoadEvent {
  type: string;
  target: Editor;
  id: number | string;
  loadData?: any;
}

export interface LoadFailEvent {
  type: string;
  target: Editor;
  msg?: any;
}

interface RemoveEvent {
  type: string;
  target: Editor;
}

interface LineDistanceEvent {
  type: string;
  target: LineSegments2;
  setLineDistance: (distance: number | 'delete') => void;
}

interface RenderEvent {
  type: string;
  target: Editor;
}

export interface PointEnterEvent {
  type: string;
  target: Object3D;
  id: string | number;
}

export interface PointInitializeEvent {
  type: string;
  target: Object3D;
  id: string | number;
}

export interface PointUnClickEvent {
  type: string;
}

export interface ChagingTransformEvent {
  type: string;
  target: Object3D;
}

export interface Events {
  [EVENTS.READY]: ReadyEvent;
  [EVENTS.LOAD_START]: LoadStartEvent;
  [EVENTS.LOAD]: LoadEvent;
  [EVENTS.RESIZE]: ResizeEvent;
  [EVENTS.REMOVE]: RemoveEvent;
  [EVENTS.LOAD_FAIL]: LoadFailEvent;
  [EVENTS.LINE_DISTANCE]: LineDistanceEvent;
  [EVENTS.RENDER]: RenderEvent;
  [EVENTS.OBJECT_CLICK]: ObjectClickEvent;
  [EVENTS.POINT_ENTER]: PointEnterEvent;
  [EVENTS.POINT_INITIALIZE]: PointInitializeEvent;
  [EVENTS.POINT_UNCLICK]: PointUnClickEvent;
  [EVENTS.CHAHEING_TRANSFORM]: ChagingTransformEvent;
}
